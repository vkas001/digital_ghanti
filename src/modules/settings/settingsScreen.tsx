import React, { useContext } from 'react';
import { View, Text, Pressable, Switch, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';

import {
  PreferenceContext,
  SENSITIVITY_MAP,
  type PreferenceContextValue,
  type SensitivityLevel,
} from '@/context/PreferenceContext';
import { BELL_TONES } from '@/lib/sound/bellPlayer';
import { useTheme } from '@/styles/useTheme';

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  const theme = useTheme();
  return (
    <View className="mb-8">
      <Text
        className="text-sm font-semibold uppercase tracking-wider mb-3"
        style={{ color: theme['text-secondary'] }}
      >
        {title}
      </Text>
      {children}
    </View>
  );
}

function SegmentedControl<T extends string | number>({
  options,
  selected,
  onSelect,
  labels,
}: {
  options: readonly T[];
  selected: T;
  onSelect: (value: T) => void;
  labels: Record<T, string>;
}) {
  const theme = useTheme();
  return (
    <View className="flex-row rounded-xl bg-[var(--surface)] p-1 border border-[var(--line)]">
      {options.map((opt) => {
        const active = opt === selected;
        return (
          <Pressable
            key={opt}
            onPress={() => onSelect(opt)}
            className={`flex-1 py-3 rounded-lg items-center ${
              active ? 'bg-[var(--accent)]' : ''
            }`}
          >
            <Text
              className="text-sm font-semibold"
              style={{ color: active ? theme['on-accent'] : theme['text-secondary'] }}
            >
              {labels[opt]}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const SENSITIVITY_LABELS: Record<SensitivityLevel, string> = {
  0: 'Low',
  1: 'Medium',
  2: 'High',
};

export default function SettingsScreen() {
  const router = useRouter();
  const theme = useTheme();
  const prefs = useContext(PreferenceContext) as PreferenceContextValue;

  return (
    <SafeAreaView
      className="flex-1 bg-[var(--background)]"
      edges={['top', 'left', 'right']}
    >
      <View className="flex-row items-center gap-3 px-5 pt-2 mb-6">
        <Pressable
          onPress={() => router.back()}
          hitSlop={12}
          className="p-2 rounded-xl bg-[var(--surface)]"
        >
          <ArrowLeft size={20} color={theme['text-primary']} />
        </Pressable>
        <Text
          className="text-lg font-semibold flex-1"
          style={{ color: theme['text-primary'] }}
        >
          Settings
        </Text>
      </View>

      <ScrollView
        className="flex-1 px-6"
        contentContainerStyle={{ paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
      >
        <Section title="Shake Sensitivity">
          <SegmentedControl
            options={[0, 1, 2] as readonly SensitivityLevel[]}
            selected={prefs.sensitivity}
            onSelect={prefs.setSensitivity}
            labels={SENSITIVITY_LABELS}
          />
        </Section>

        <Section title="Bell Sound">
          <View className="rounded-xl border border-[var(--line)] overflow-hidden bg-[var(--surface)]">
            {BELL_TONES.map((tone, i) => {
              const active = prefs.toneId === tone.id;
              return (
                <Pressable
                  key={tone.id}
                  onPress={() => prefs.setToneId(tone.id)}
                  className={`flex-row items-center px-4 py-4 ${
                    i < BELL_TONES.length - 1 ? 'border-b border-[var(--line)]' : ''
                  } ${active ? 'bg-[var(--accent)]/5' : ''}`}
                >
                  <View className="flex-1">
                    <Text
                      className="text-base font-medium"
                      style={{
                        color: active ? theme.accent : theme['text-primary'],
                      }}
                    >
                      {tone.label}
                    </Text>
                    <Text
                      className="text-sm mt-0.5"
                      style={{ color: theme['text-secondary'] }}
                    >
                      {tone.description}
                    </Text>
                  </View>
                  {active && (
                    <View
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: theme.accent }}
                    />
                  )}
                </Pressable>
              );
            })}
          </View>
        </Section>

        <Section title="Haptics">
          <View className="flex-row items-center justify-between rounded-xl bg-[var(--surface)] border border-[var(--line)] px-4 py-4">
            <Text
              className="text-base"
              style={{ color: theme['text-primary'] }}
            >
              Vibrate on ring
            </Text>
            <Switch
              value={prefs.haptics}
              onValueChange={prefs.setHaptics}
              trackColor={{ true: theme.accent, false: theme.line }}
              thumbColor="white"
            />
          </View>
        </Section>
      </ScrollView>
    </SafeAreaView>
  );
}