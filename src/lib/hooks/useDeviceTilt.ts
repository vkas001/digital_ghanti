import { useEffect } from 'react';

import { subscribeToAppState } from '@/lib/appStateSensor';
import { createSwayTracker } from '@/lib/gyro';

import type { SharedValue } from 'react-native-reanimated';

/**
 * Wires the gyroscope sway tracker to a reanimated `SharedValue` so the bell
 * glyph can mirror the phone's motion on the UI thread without re-rendering.
 * Owns the sensor lifecycle: subscribes on mount, unsubscribes on unmount,
 * and pauses whenever the app backgrounds.
 */
export function useDeviceTilt(sway: SharedValue<number>, enabled: boolean) {
  useEffect(() => {
    if (!enabled) return;

    const tracker = createSwayTracker((degrees) => {
      sway.value = degrees;
    });
    tracker.start();
    const unsubscribeAppState = subscribeToAppState(tracker);

    return () => {
      unsubscribeAppState();
      tracker.stop();
    };
  }, [sway, enabled]);
}