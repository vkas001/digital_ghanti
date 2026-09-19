import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { Bell, Settings } from 'lucide-react-native';

import { BELL_TONES } from '@/lib/sound/bellPlayer';
import { useTheme } from '@/styles/useTheme';

export function AppHeader({
  onSettingsPress,
}: {
  onSettingsPress: () => void;
}) {
  const theme = useTheme();
  return (
    <View className="flex-row items-center justify-between bg-[var(--accent)] px-6 pt-4 pb-3">
      <View className="flex-row items-center gap-3">
        <View className="h-10 w-10 items-center justify-center rounded-xl bg-[var(--accent-strong)]">
          <Bell size={20} color={theme['on-accent']} />
        </View>
        <View>
          <Text
            className="text-lg font-bold"
            style={{ color: theme['on-accent'] }}
          >
            Digital Ghanti
          </Text>
          <Text
            className="text-xs"
            style={{ color: theme['on-accent'], opacity: 0.7 }}
          >
            {BELL_TONES.length} bell sounds · shake or tap to ring
          </Text>
        </View>
      </View>
      <Pressable
        onPress={onSettingsPress}
        hitSlop={12}
        className="rounded-xl bg-[var(--surface)] p-3 active:bg-[var(--line)]"
      >
        <Settings size={20} color={theme['text-secondary']} />
      </Pressable>
    </View>
  );
}