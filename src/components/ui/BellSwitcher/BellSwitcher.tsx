import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Text, View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withRepeat,
  withDelay,
  runOnJS,
  Easing,
  type SharedValue,
  type WithSpringConfig,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';

import { BellGlyph } from '@/components/ui/BellGlyph/BellGlyph';
import {
  BELL_TONES,
  getTone,
  getToneIndex,
  type ToneId,
} from '@/lib/sound/bellPlayer';
import { useTheme } from '@/styles/useTheme';

const DRAG_MAX = 130;
const SWIPE_THRESHOLD = 60;
const HORIZONTAL_ACTIVATION = 16;
const VERTICAL_FAIL = 26;

const SPRING: WithSpringConfig = {
  damping: 20,
  stiffness: 240,
  mass: 0.8,
};

/**
 * The home-pivot bell switcher. Horizontal swipes cycle the bell type: the
 * bell glyph follows the finger and slides in/out on change, while the label
 * crossfades in place, the pagination dots stay put, and pulsing chevrons
 * flank the bell as a "swappable" affordance. Tapping rings the current bell.
 * The selected bell is owned by the parent via `toneId`.
 */
export function BellSwitcher({
  toneId,
  ringToken,
  ringStrength = 1,
  sway,
  onSwipeNext,
  onSwipePrevious,
  onTap,
  size = 160,
}: {
  toneId: ToneId;
  ringToken: number;
  ringStrength?: number;
  sway?: SharedValue<number>;
  onSwipeNext: () => void;
  onSwipePrevious: () => void;
  onTap: () => void;
  size?: number;
}) {
  const theme = useTheme();
  const tone = getTone(toneId);
  const toneIndex = getToneIndex(toneId);

  const [labelToneId, setLabelToneId] = useState<ToneId>(toneId);

  const translateX = useSharedValue(0);
  const opacity = useSharedValue(1);
  const labelOpacity = useSharedValue(1);
  const chevronLeftOpacity = useSharedValue(0.35);
  const chevronRightOpacity = useSharedValue(0.35);
  const swipeDirection = useSharedValue(1);
  const firstRender = useRef(true);

  useEffect(() => {
    const timeline = { duration: 700, easing: Easing.inOut(Easing.quad) };
    chevronLeftOpacity.value = withRepeat(withTiming(1, timeline), -1, true);
    chevronRightOpacity.value = withRepeat(
      withDelay(700, withTiming(1, timeline)),
      -1,
      true,
    );
  }, []);

  const dispatch = useCallback(
    (goingNext: boolean) => {
      if (goingNext) onSwipeNext();
      else onSwipePrevious();
    },
    [onSwipeNext, onSwipePrevious],
  );

  const pan = useMemo(
    () =>
      Gesture.Pan()
        .activeOffsetX([-HORIZONTAL_ACTIVATION, HORIZONTAL_ACTIVATION])
        .failOffsetY([-VERTICAL_FAIL, VERTICAL_FAIL])
        .onUpdate((e) => {
          translateX.value = Math.max(-DRAG_MAX, Math.min(DRAG_MAX, e.translationX));
        })
        .onEnd((e) => {
          if (Math.abs(e.translationX) < SWIPE_THRESHOLD) {
            translateX.value = withSpring(0, SPRING);
            return;
          }
          const goingNext = e.translationX < 0;
          swipeDirection.value = goingNext ? 1 : -1;
          runOnJS(dispatch)(goingNext);
        }),
    [translateX, swipeDirection, dispatch],
  );

  const tap = useMemo(
    () => Gesture.Tap().maxDuration(300).onEnd(() => runOnJS(onTap)()),
    [onTap],
  );

  const gesture = useMemo(() => Gesture.Race(pan, tap), [pan, tap]);

  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      setLabelToneId(toneId);
      return;
    }

    const from = swipeDirection.value > 0 ? DRAG_MAX : -DRAG_MAX;
    translateX.value = from;
    opacity.value = 0.35;
    translateX.value = withSpring(0, SPRING);
    opacity.value = withTiming(1, { duration: 280 });

    labelOpacity.value = withTiming(0, { duration: 140 }, (finished) => {
      'worklet';
      if (finished) {
        runOnJS(setLabelToneId)(toneId);
        labelOpacity.value = withTiming(1, { duration: 240 });
      }
    });
  }, [toneId]);

  const slideStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
    opacity: opacity.value,
  }));

  const labelStyle = useAnimatedStyle(() => ({
    opacity: labelOpacity.value,
  }));

  const chevronLeftStyle = useAnimatedStyle(() => ({
    opacity: chevronLeftOpacity.value,
  }));

  const chevronRightStyle = useAnimatedStyle(() => ({
    opacity: chevronRightOpacity.value,
  }));

  return (
    <GestureDetector gesture={gesture}>
      <View className="w-full items-center gap-5">
        <View className="w-full flex-row items-center justify-between px-1">
          <Animated.View style={chevronLeftStyle}>
            <ChevronLeft size={26} color={theme['text-secondary']} />
          </Animated.View>

          <Animated.View style={slideStyle}>
            <BellGlyph
              ringToken={ringToken}
              ringStrength={ringStrength}
              sway={sway}
              size={size}
            />
          </Animated.View>

          <Animated.View style={chevronRightStyle}>
            <ChevronRight size={26} color={theme['text-secondary']} />
          </Animated.View>
        </View>

        <View className="items-center gap-1">
          <Animated.Text
            className="text-2xl font-bold"
            style={[labelStyle, { color: theme['text-primary'] }]}
          >
            {getTone(labelToneId).label}
          </Animated.Text>
          <Animated.Text
            className="text-sm"
            style={[labelStyle, { color: theme['text-secondary'] }]}
          >
            {getTone(labelToneId).description}
          </Animated.Text>
          <Text
            className="text-xs mt-1"
            style={{ color: theme['text-secondary'], opacity: 0.7 }}
          >
            tap the bell to ring
          </Text>
        </View>

        <View className="flex-row items-center gap-2">
          <View className="flex-row items-center gap-1.5">
            {BELL_TONES.map((t, i) => (
              <View
                key={t.id}
                className="rounded-full"
                style={{
                  width: i === toneIndex ? 16 : 6,
                  height: 6,
                  backgroundColor:
                    i === toneIndex ? theme.accent : theme.line,
                }}
              />
            ))}
          </View>
          <Text
            className="text-xs tabular-nums ml-2"
            style={{ color: theme['text-secondary'], opacity: 0.7 }}
          >
            {toneIndex + 1}/{BELL_TONES.length}
          </Text>
        </View>
      </View>
    </GestureDetector>
  );
}