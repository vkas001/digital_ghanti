import React, { createContext, useCallback, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { type ToneId } from '@/lib/sound/bellPlayer';

const STORAGE_KEY = 'ghanti.prefs.v1';

export type SensitivityLevel = 0 | 1 | 2;

export const SENSITIVITY_MAP: readonly {
  level: SensitivityLevel;
  label: string;
  threshold: number;
}[] = [
  { level: 0, label: 'Low', threshold: 1.8 },
  { level: 1, label: 'Medium', threshold: 1.3 },
  { level: 2, label: 'High', threshold: 0.9 },
];

type PreferenceState = {
  sensitivity: SensitivityLevel;
  toneId: ToneId;
  haptics: boolean;
};

export type PreferenceContextValue = PreferenceState & {
  threshold: number;
  setSensitivity: (level: SensitivityLevel) => void;
  setToneId: (id: ToneId) => void;
  setHaptics: (on: boolean) => void;
};

const DEFAULT_STATE: PreferenceState = {
  sensitivity: 1,
  toneId: 'temple',
  haptics: true,
};

export const PreferenceContext =
  createContext<PreferenceContextValue | null>(null);

async function loadPrefs(): Promise<PreferenceState> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    return raw ? { ...DEFAULT_STATE, ...JSON.parse(raw) } : DEFAULT_STATE;
  } catch {
    return DEFAULT_STATE;
  }
}

async function savePrefs(state: PreferenceState) {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // storage write failures are non-critical
  }
}

export function PreferenceProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [state, setState] = useState<PreferenceState>(DEFAULT_STATE);

  useEffect(() => {
    loadPrefs().then(setState);
  }, []);

  useEffect(() => {
    savePrefs(state);
  }, [state]);

  const setSensitivity = useCallback((sensitivity: SensitivityLevel) => {
    setState((p) => ({ ...p, sensitivity }));
  }, []);

  const setToneId = useCallback((toneId: ToneId) => {
    setState((p) => ({ ...p, toneId }));
  }, []);

  const setHaptics = useCallback((haptics: boolean) => {
    setState((p) => ({ ...p, haptics }));
  }, []);

  const value: PreferenceContextValue = {
    ...state,
    threshold: SENSITIVITY_MAP[state.sensitivity].threshold,
    setSensitivity,
    setToneId,
    setHaptics,
  };

  return (
    <PreferenceContext.Provider value={value}>
      {children}
    </PreferenceContext.Provider>
  );
}