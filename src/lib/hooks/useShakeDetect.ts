import { useEffect } from 'react';

import {
  createShakeDetector,
  subscribeToAppState,
} from '@/lib/shake';

/**
 * Wires the accelerometer shake service to a callback. Owns the full sensor
 * lifecycle: subscribes on mount, unsubscribes on unmount, and pauses the
 * sensor whenever the app leaves `active` state via AppState — so a shake is
 * never detected while backgrounded and no listener is ever leaked.
 */
export function useShakeDetect(
  onShake: () => void,
  threshold: number,
  enabled: boolean,
) {
  useEffect(() => {
    if (!enabled) return;

    const detector = createShakeDetector(onShake, threshold);
    detector.start();
    const unsubscribeAppState = subscribeToAppState(detector);

    return () => {
      unsubscribeAppState();
      detector.stop();
    };
  }, [onShake, threshold, enabled]);
}