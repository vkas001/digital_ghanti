import { useCallback, useEffect, useRef } from 'react';

import { ringInSilentMode } from '@/lib/audio';
import { getTone, type ToneId } from '@/lib/sound/bellPlayer';
import { useAudioPlayer } from 'expo-audio';

/**
 * Bell playback hook wrapping expo-audio. The player is created with the
 * selected tone's bundled WAV, swapped via `replace()` when the tone changes,
 * and rings by seeking back to 0 and playing — so a shake while a bell is
 * still fading re-strikes it instead of stacking overlapping players.
 */
export function useBellPlayer(toneId: ToneId) {
  const tone = getTone(toneId);
  const player = useAudioPlayer(tone.source, { updateInterval: 250 });
  const lastToneRef = useRef(toneId);

  useEffect(() => {
    void ringInSilentMode();
  }, []);

  useEffect(() => {
    if (lastToneRef.current !== toneId) {
      lastToneRef.current = toneId;
      player.replace(tone.source);
    }
  }, [player, toneId, tone.source]);

  const ring = useCallback(() => {
    player.seekTo(0);
    player.play();
  }, [player]);

  return { ring, player };
}