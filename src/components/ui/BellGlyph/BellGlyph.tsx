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
const MAX_SCALE_BOOST = 0.1;

/**
 * Animated bell glyph — swings when `ringToken` changes (incrementing number)
 * and scale-bounces proportional to `ringStrength` (0..1: how hard the bell
 * was struck). Pass a new number on each ring to trigger the animation.
 */
export function BellGlyph({
  ringToken,
  ringStrength = 1,
  size = 120,
  style,
}: {
  ringToken: number;
  ringStrength?: number;
  size?: number;
  style?: ViewStyle;
}) {
  const theme = useTheme();
  const swing = useSharedValue(0);
  const scale = useSharedValue(1);

  React.useEffect(() => {
    swing.value = 0;
    swing.value = withSequence(
      withTiming(1, { duration: 150, easing: Easing.out(Easing.quad) }),
      withTiming(-0.6, { duration: 180 }),
      withTiming(0.4, { duration: 160 }),
      withTiming(-0.2, { duration: 130 }),
      withTiming(0, { duration: 100, easing: Easing.inOut(Easing.quad) }),
    );

    const boost = 1 + MAX_SCALE_BOOST * ringStrength;
    scale.value = 1;
    scale.value = withSequence(
      withTiming(boost, {
        duration: 120,
        easing: Easing.out(Easing.quad),
      }),
      withTiming(1, { duration: 260, easing: Easing.inOut(Easing.quad) }),
    );
  }, [ringToken, ringStrength]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { rotate: `${SWING_DEGREES * swing.value}deg` },
      { scale: scale.value },
    ],
  }));

  return (
    <View className="items-center justify-center" style={style}>
      <Animated.View style={animatedStyle}>
        <Bell size={size} color={theme.accent} strokeWidth={1.5} />
      </Animated.View>
    </View>
  );
}