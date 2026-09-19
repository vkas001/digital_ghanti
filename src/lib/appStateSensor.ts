import { AppState } from 'react-native';

export type SensorHandle = {
  start: () => void;
  stop: () => void;
};

/**
 * Pauses a sensor whenever the app leaves `active` state and resumes it on the
 * way back in. Shared by the accelerometer (shake) and gyroscope (tilt)
 * trackers so no sensor ever runs or leaks while backgrounded.
 */
export function subscribeToAppState(sensor: SensorHandle): () => void {
  const sub = AppState.addEventListener('change', (state) => {
    if (state === 'active') sensor.start();
    else sensor.stop();
  });
  return () => sub.remove();
}