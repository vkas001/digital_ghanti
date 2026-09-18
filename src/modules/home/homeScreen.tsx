import React, { useCallback, useContext, useEffect, useRef, useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Settings } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

import { BellGlyph } from '@/components/ui/BellGlyph/BellGlyph';
import { useBellPlayer } from '@/lib/hooks/useBellPlayer';
import { useShakeDetect } from '@/lib/hooks/useShakeDetect';
import {
  PreferenceContext,
  type PreferenceContextValue,
} from '@/context/PreferenceContext';
import { isShakeSupported } from '@/lib/shake';
import { useTheme } from '@/styles/useTheme';

export default function HomeScreen() {
  const router = useRouter();
  const theme = useTheme();
  const prefs = useContext(PreferenceContext) as PreferenceContextValue;

  const [ringCount, setRingCount] = useState(0);
  const [ringToken, setRingToken] = useState(0);
  const [shakeReady, setShakeReady] = useState<boolean | null>(null);
  const ringCountRef = useRef(0);

  const { ring } = useBellPlayer(prefs.toneId);

  const doRing = useCallback(() => {
    ring();
    ringCountRef.current += 1;
    setRingCount(ringCountRef.current);
    setRingToken((t) => t + 1);
    if (prefs.haptics) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(
        () => {},
      );
    }
  }, [ring, prefs.haptics]);

  useShakeDetect(doRing, prefs.threshold, shakeReady === true);

  useEffect(() => {
    isShakeSupported().then(setShakeReady);
  }, []);

  return (
    <SafeAreaView
      className="flex-1 bg-[var(--background)]"
      edges={['top', 'left', 'right']}
    >
      <View className="flex-1 px-6 pt-4 pb-10">
        <View className="flex-row justify-end mb-2">
          <Pressable
            onPress={() => router.push('/settings')}
            hitSlop={12}
            className="p-3 rounded-xl bg-[var(--surface)]"
          >
            <Settings size={22} color={theme['text-secondary']} />
          </Pressable>
        </View>

        <View className="flex-1 items-center justify-center gap-6">
          <BellGlyph ringToken={ringToken} size={140} />

          <Text
            className="text-xl font-semibold"
            style={{ color: theme['text-primary'] }}
          >
            Digital Ghanti
          </Text>

          {ringCount > 0 && (
            <Text
              className="text-base tabular-nums"
              style={{ color: theme['text-secondary'] }}
            >
              Rang {ringCount} {ringCount === 1 ? 'time' : 'times'}
            </Text>
          )}

          <Pressable
            onPress={doRing}
            className="mt-4 rounded-full bg-[var(--accent)] px-10 py-4 active:bg-[var(--accent-strong)]"
          >
            <Text className="text-[var(--on-accent)] text-base font-bold tracking-wide">
              Ring
            </Text>
          </Pressable>

          <Text
            className="text-sm mt-2"
            style={{ color: theme['text-secondary'] }}
          >
            {shakeReady === null
              ? 'Checking sensor…'
              : shakeReady
              ? 'Shake to ring or tap the bell'
              : 'Tap the button — shake not available here'}
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}