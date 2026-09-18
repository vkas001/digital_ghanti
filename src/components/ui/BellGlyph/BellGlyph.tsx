import React from 'react';
import { View, type ViewStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSequence,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { Bell } from 'lucide-react-native';
import { useTheme } from '@/styles/useTheme';

const SWING_DEGREES = 14;

/**
 * Animated bell glyph — swings when `ringToken` changes (incrementing number).
 * Pass a new number on each ring to trigger the animation.
 */
export function BellGlyph({
  ringToken,
  size = 120,
  style,
}: {
  ringToken: number;
  size?: number;
  style?: ViewStyle;
}) {
  const theme = useTheme();
  const swing = useSharedValue(0);

  React.useEffect(() => {
    swing.value = 0;
    swing.value = withSequence(
      withTiming(1, { duration: 150, easing: Easing.out(Easing.quad) }),
      withTiming(-0.6, { duration: 180 }),
      withTiming(0.4, { duration: 160 }),
      withTiming(-0.2, { duration: 130 }),
      withTiming(0, { duration: 100, easing: Easing.inOut(Easing.quad) }),
    );
  }, [ringToken]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${SWING_DEGREES * swing.value}deg` }],
  }));

  return (
    <View className="items-center justify-center" style={style}>
      <Animated.View style={animatedStyle}>
        <Bell size={size} color={theme.accent} strokeWidth={1.5} />
      </Animated.View>
    </View>
  );
}