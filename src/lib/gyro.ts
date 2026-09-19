import { Gyroscope, type GyroscopeMeasurement } from 'expo-sensors';
import { Platform } from 'react-native';

import type { SensorHandle } from '@/lib/appStateSensor';

export const GYRO_UPDATE_INTERVAL_MS = 32;
export const SWAY_MAX_DEG = 28;

/**
 * Per-sample integration gain (degrees per rad/s) and leak factor toward
 * neutral. The sway ramps up while the phone is being spun and decays back to
 * 0 when it still — a live "the bell follows the phone" motion.
 */
const SWAY_GAIN = 0.6;
const SWAY_DAMP = 0.9;

export type SwayCallback = (degrees: number) => void;

export async function isTiltSupported(): Promise<boolean> {
  if (Platform.OS === 'web') return false;
  try {
    return await Gyroscope.isAvailableAsync();
  } catch {
    return false;
  }
}

/**
 * Gyroscope-driven sway tracker. Rotates the long axis (phone seesawing
 * left/right) primarily, with a touch of the screen-plane twist, integrated
 * into a degree angle that decays toward neural. Clamped so the bell can't
 * flip unnaturally.
 */
export function createSwayTracker(onSway: SwayCallback): SensorHandle {
  let sway = 0;
  let active = false;

  const handleSample = (m: GyroscopeMeasurement) => {
    sway = sway * SWAY_DAMP + SWAY_GAIN * (m.y + m.z * 0.4);
    sway = Math.max(-SWAY_MAX_DEG, Math.min(SWAY_MAX_DEG, sway));
    onSway(sway);
  };

  return {
    start() {
      if (active) return;
      active = true;
      try {
        Gyroscope.setUpdateInterval(GYRO_UPDATE_INTERVAL_MS);
        Gyroscope.addListener(handleSample);
      } catch {
        active = false;
      }
    },
    stop() {
      if (!active) return;
      active = false;
      Gyroscope.removeAllListeners();
    },
  };
}