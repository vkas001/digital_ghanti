import { useEffect } from 'react';

import { subscribeToAppState } from '@/lib/appStateSensor';
import { createShakeDetector, type ShakeStateCallbacks } from '@/lib/shake';

/**
 * Wires the accelerometer shake service to a callback. Owns the full sensor
 * lifecycle: subscribes on mount, unsubscribes on unmount, and pauses the
 * sensor whenever the app leaves `active` state via AppState — so a shake is
 * never detected while backgrounded and no listener is ever leaked. The
 * callbacks model shaking as a motion state (start / live intensity / stop).
 */
export function useShakeDetect(
  callbacks: ShakeStateCallbacks,
  threshold: number,
  enabled: boolean,
) {
  const { onStart, onIntensity, onStop } = callbacks;

  useEffect(() => {
    if (!enabled) return;

    const detector = createShakeDetector(
      { onStart, onIntensity, onStop },
      threshold,
    );
    detector.start();
    const unsubscribeAppState = subscribeToAppState(detector);

    return () => {
      unsubscribeAppState();
      detector.stop();
    };
  }, [onStart, onIntensity, onStop, threshold, enabled]);
}