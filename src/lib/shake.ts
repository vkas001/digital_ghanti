import { Accelerometer, type AccelerometerMeasurement } from 'expo-sensors';
import { Platform } from 'react-native';

/**
 * Accelerometer-based shake detector.
 *
 * The Accelerometer reports acceleration in g (gravity included): at rest the
 * magnitude is ~1g no matter the phone's orientation. A shake is a sustained
 * stream of motion, so instead of firing on a single magnitude jump we keep an
 * exponentially-smoothed `intensity` — an EMA of the per-sample *vector*
 * distance between readings, which catches both linear pushes and rotations
 * that spin the gravity vector around.
 *
 * Rather than discrete ring events, the detector is a motion-state machine:
 *
 *   - `onStart(strength)` fires when intensity first crosses the threshold
 *     (hysteresis: stops only below `threshold × 0.6`);
 *   - `onIntensity(strength)` fires on every sample while shaking so a live
 *     volume can follow the force — harder shake = louder;
 *   - `onStop()` fires when shaking ends, so the continuous ring can be cut.
 *
 * Lifecycle: `start()` / `stop()` subscribe/unsubscribe the sensor. The hook
 * (`useShakeDetect`) also pauses the detector when the app backgrounds — the
 * sensor must never outlive the screen.
 */

/** Sensor cadence. A lower interval keeps the intensity EMA snappy. */
export const SHAKE_UPDATE_INTERVAL_MS = 40;
export const SHAKE_INTENSITY_DECAY = 0.82;
export const SHAKE_STOP_FACTOR = 0.6;

/**
 * A shake's force is normalized to a volume 0..1. `SHAKE_MIN_VOLUME` is the
 * softest ring a just-past-threshold shake gets; an intensity of
 * `SHAKE_VOLUME_RANGE` g above the threshold reaches full volume.
 */
export const SHAKE_MIN_VOLUME = 0.25;
export const SHAKE_VOLUME_RANGE = 3.5;

export type ShakeThreshold = number;
export type ShakeStrength = number;

export type ShakeStateCallbacks = {
  onStart: (strength: ShakeStrength) => void;
  onIntensity: (strength: ShakeStrength) => void;
  onStop: () => void;
};

export type ShakeDetector = {
  start: () => void;
  stop: () => void;
  setThreshold: (threshold: ShakeThreshold) => void;
};

export function shakeStrength(
  intensity: number,
  threshold: number,
): ShakeStrength {
  return Math.min(1, SHAKE_MIN_VOLUME + (intensity - threshold) / SHAKE_VOLUME_RANGE);
}

export async function isShakeSupported(): Promise<boolean> {
  if (Platform.OS === 'web') return false;
  try {
    return await Accelerometer.isAvailableAsync();
  } catch {
    return false;
  }
}

export function createShakeDetector(
  callbacks: ShakeStateCallbacks,
  initialThreshold: ShakeThreshold,
): ShakeDetector {
  let threshold = initialThreshold;
  let lastX = 0;
  let lastY = 0;
  let lastZ = 0;
  let hasSample = false;
  let intensity = 0;
  let shaking = false;
  let active = false;

  const handleSample = (m: AccelerometerMeasurement) => {
    const jump = hasSample
      ? Math.hypot(m.x - lastX, m.y - lastY, m.z - lastZ)
      : 0;
    lastX = m.x;
    lastY = m.y;
    lastZ = m.z;
    hasSample = true;

    const capJump = Math.min(jump, 6);
    intensity =
      intensity * SHAKE_INTENSITY_DECAY +
      capJump * (1 - SHAKE_INTENSITY_DECAY);

    if (!shaking) {
      if (intensity < threshold) return;
      shaking = true;
      callbacks.onStart(shakeStrength(intensity, threshold));
      return;
    }

    callbacks.onIntensity(shakeStrength(intensity, threshold));
    if (intensity < threshold * SHAKE_STOP_FACTOR) {
      shaking = false;
      callbacks.onStop();
    }
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