import React from 'react';
import { TouchableOpacity, Text, type ViewStyle } from 'react-native';
import { useTheme } from '@/styles/useTheme';

type ButtonProps = {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'ghost';
  style?: ViewStyle;
};

export function Button({
  label,
  onPress,
  variant = 'primary',
  style,
}: ButtonProps) {
  const theme = useTheme();

  const isPrimary = variant === 'primary';

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      className={`rounded-2xl px-8 py-4 items-center ${
        isPrimary ? 'bg-[var(--accent)]' : 'bg-transparent'
      }`}
      style={style}
    >
      <Text
        className="text-base font-semibold"
        style={{
          color: isPrimary ? theme['on-accent'] : theme.accent,
        }}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}