import { setAudioModeAsync } from 'expo-audio';

export function ringInSilentMode(): Promise<void> {
  return setAudioModeAsync({ playsInSilentMode: true });
}