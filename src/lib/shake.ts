import { Accelerometer, type AccelerometerMeasurement } from 'expo-sensors';
import { AppState, Platform } from 'react-native';

/**
 * Accelerometer-based shake detector.
 *
 * The Accelerometer reports acceleration in g (gravity included): at rest the
 * magnitude is ~1g no matter the phone's orientation. A shake is detected as a
 * sharp change in that magnitude between consecutive samples.
 *
 * Lifecycle: `start()` / `stop()` subscribe/unsubscribe the sensor. The hook
 * (`useShakeDetect`) also pauses the detector when the app backgrounds — the
 * sensor must never outlive the screen.
 */

export const SHAKE_UPDATE_INTERVAL_MS = 100;
export const SHAKE_DEBOUNCE_MS = 700;

export type ShakeThreshold = number;

export type ShakeDetector = {
  start: () => void;
  stop: () => void;
  setThreshold: (threshold: ShakeThreshold) => void;
};

export async function isShakeSupported(): Promise<boolean> {
  if (Platform.OS === 'web') return false;
  try {
    return await Accelerometer.isAvailableAsync();
  } catch {
    return false;
  }
}

export function createShakeDetector(
  onShake: () => void,
  initialThreshold: ShakeThreshold,
): ShakeDetector {
  let threshold = initialThreshold;
  let lastMagnitude = 1;
  let lastShakeAt = 0;
  let active = false;

  const handleSample = (m: AccelerometerMeasurement) => {
    const magnitude = Math.sqrt(m.x * m.x + m.y * m.y + m.z * m.z);
    const jump = Math.abs(magnitude - lastMagnitude);
    lastMagnitude = magnitude;

    if (jump < threshold) return;
    const now = Date.now();
    if (now - lastShakeAt < SHAKE_DEBOUNCE_MS) return;

    lastShakeAt = now;
    onShake();
  };

  return {
    start() {
      if (active) return;
      active = true;
      try {
        Accelerometer.setUpdateInterval(SHAKE_UPDATE_INTERVAL_MS);
        Accelerometer.addListener(handleSample);
      } catch {
        active = false;
      }
    },
    stop() {
      if (!active) return;
      active = false;
      Accelerometer.removeAllListeners();
    },
    setThreshold(next: ShakeThreshold) {
      threshold = next;
    },
  };
}

export function subscribeToAppState(detector: ShakeDetector): () => void {
  const sub = AppState.addEventListener('change', (state) => {
    if (state === 'active') detector.start();
    else detector.stop();
  });
  return () => sub.remove();
}