'use client';

import { usePlayerStore } from '@/stores/player.store';
import type { TrackResponse } from '@/types';

/** Full store — re-renders on any state change. Use sparingly. */
export function usePlayer() { return usePlayerStore(); }

// ── Granular selectors — only re-render when the selected slice changes ───────

export const useCurrentTrack  = () => usePlayerStore(s => s.currentTrack);
export const useIsPlaying     = () => usePlayerStore(s => s.isPlaying);
export const useIsLoading     = () => usePlayerStore(s => s.isLoading);
export const useRepeatMode    = () => usePlayerStore(s => s.repeatMode);
export const useIsShuffled    = () => usePlayerStore(s => s.isShuffled);
export const useQueue         = () => usePlayerStore(s => s.queue);
export const useQueueIndex    = () => usePlayerStore(s => s.queueIndex);
export const useRecentlyPlayed= () => usePlayerStore(s => s.recentlyPlayed);

export function usePlayerProgress() {
  const progressSec = usePlayerStore(s => s.progressSec);
  const durationSec = usePlayerStore(s => s.durationSec);
  const seekTo      = usePlayerStore(s => s.seekTo);
  const pct         = durationSec > 0 ? (progressSec / durationSec) * 100 : 0;
  const remaining   = Math.max(0, durationSec - progressSec);
  return { progressSec, durationSec, seekTo, pct, remaining };
}

export function usePlayerVolume() {
  const volume      = usePlayerStore(s => s.volume);
  const isMuted     = usePlayerStore(s => s.isMuted);
  const setVolume   = usePlayerStore(s => s.setVolume);
  const toggleMute  = usePlayerStore(s => s.toggleMute);
  const effective   = isMuted ? 0 : volume;
  return { volume, isMuted, setVolume, toggleMute, effective };
}

export function usePlayerTransport() {
  return {
    togglePlay:    usePlayerStore(s => s.togglePlay),
    play:          usePlayerStore(s => s.play),
    pause:         usePlayerStore(s => s.pause),
    resume:        usePlayerStore(s => s.resume),
    playNext:      usePlayerStore(s => s.playNext),
    playPrevious:  usePlayerStore(s => s.playPrevious),
    cycleRepeat:   usePlayerStore(s => s.cycleRepeat),
    toggleShuffle: usePlayerStore(s => s.toggleShuffle),
  };
}

/**
 * usePlayTrack — per-card / per-row play hook.
 * Returns a stable `handlePlay` and derived booleans.
 */
export function usePlayTrack(track: TrackResponse, queue?: TrackResponse[]) {
  const currentTrack = usePlayerStore(s => s.currentTrack);
  const isPlaying    = usePlayerStore(s => s.isPlaying);
  const play         = usePlayerStore(s => s.play);
  const pause        = usePlayerStore(s => s.pause);
  const resume       = usePlayerStore(s => s.resume);

  const isCurrent = currentTrack?.id === track.id;
  const isActive  = isCurrent && isPlaying;

  const handlePlay = () => {
    if (isCurrent) { isPlaying ? pause() : resume(); }
    else play(track, queue ?? [track]);
  };

  return { isCurrent, isActive, handlePlay };
}
