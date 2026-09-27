import { useCallback, useEffect, useRef } from 'react';
import { AppState } from 'react-native';

import { ringInSilentMode } from '@/lib/audio';
import { getTone, type ToneId } from '@/lib/sound/bellPlayer';
import { useAudioPlayer } from 'expo-audio';

/**
 * Bell playback hook wrapping expo-audio. Two players:
 *
 *  - `strikePlayer` — the single-strike tone. Used by taps/buttons, rings by
 *    seeking to 0 and playing so a re-hit truncates cleanly.
 *  - `sustainPlayer` — the seamless ring-body loop, used while the phone is
 *    being shaken. It loops continuously with `player.loop`, and its volume
 *    is updated live from shake intensity (harder shake = louder), so a
 *    sustained shake is one continuous ringing bell. Stopping plays a final
 *    single strike so the bell rings out naturally.
 *
 * Both players swap source via `replace()` when the tone changes.
 */
export function useBellPlayer(toneId: ToneId) {
  const tone = getTone(toneId);
  const strikePlayer = useAudioPlayer(tone.source, { updateInterval: 1000 });
  const sustainPlayer = useAudioPlayer(tone.ringSource, {
    updateInterval: 1000,
  });
  const lastToneRef = useRef(toneId);
  const sustainActiveRef = useRef(false);
  const lastStrengthRef = useRef(1);

  useEffect(() => {
    void ringInSilentMode();
  }, []);

  useEffect(() => {
    if (lastToneRef.current !== toneId) {
      lastToneRef.current = toneId;
      strikePlayer.replace(tone.source);
      sustainPlayer.replace(tone.ringSource);
    }
  }, [strikePlayer, sustainPlayer, toneId, tone.source, tone.ringSource]);

  /** One strike of the current bell. Defaults to full volume (tap / button). */
  const ringOnce = useCallback(
    (strength = 1) => {
      strikePlayer.volume = Math.max(0, Math.min(1, strength));
      strikePlayer.seekTo(0);
      strikePlayer.play();
    },
    [strikePlayer],
  );

  /** Begin the continuous ring loop while shaking. */
  const startRing = useCallback(
    (strength: number) => {
      lastStrengthRef.current = strength;
      sustainPlayer.loop = true;
      sustainPlayer.volume = Math.max(0, Math.min(1, strength));
      sustainPlayer.play();
      sustainActiveRef.current = true;
    },
    [sustainPlayer],
  );

  /** Track shake force into the loop's volume while ringing. */
  const updateRingVolume = useCallback(
    (strength: number) => {
      lastStrengthRef.current = strength;
      sustainPlayer.volume = Math.max(0, Math.min(1, strength));
    },
    [sustainPlayer],
  );

  /** End the continuous ring and let the bell ring out with one last strike. */
  const stopRing = useCallback(() => {
    if (!sustainActiveRef.current) return;
    sustainActiveRef.current = false;
    sustainPlayer.pause();
    ringOnce(lastStrengthRef.current);
  }, [sustainPlayer, ringOnce]);

  useEffect(() => {
    const sub = AppState.addEventListener('change', (state) => {
      if (state !== 'active' && sustainActiveRef.current) {
        sustainActiveRef.current = false;
        sustainPlayer.pause();
      }
    });
    return () => sub.remove();
  }, [sustainPlayer]);

  return { ringOnce, startRing, updateRingVolume, stopRing, strikePlayer };
}