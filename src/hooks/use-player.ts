'use client';

import { usePlayerStore } from '@/stores/player.store';
import type { TrackResponse } from '@/types';

/**
 * usePlayer
 *
 * Thin selector-based hook. Import individual pieces to avoid
 * re-rendering components when unrelated player state changes.
 *
 * @example
 * const { currentTrack, isPlaying, togglePlay } = usePlayer();
 * const { progressSec, durationSec, seekTo } = usePlayerProgress();
 * const { volume, isMuted, setVolume, toggleMute } = usePlayerVolume();
 */

// Full player state — use sparingly (any state change triggers re-render)
export function usePlayer() {
  return usePlayerStore();
}

// Playback identity
export function useCurrentTrack(): TrackResponse | null {
  return usePlayerStore((s) => s.currentTrack);
}

export function useIsPlaying(): boolean {
  return usePlayerStore((s) => s.isPlaying);
}

export function useIsLoading(): boolean {
  return usePlayerStore((s) => s.isLoading);
}

export function useIsCurrentTrack(trackId: string): boolean {
  return usePlayerStore((s) => s.currentTrack?.id === trackId);
}

export function useIsCurrentAndPlaying(trackId: string): boolean {
  return usePlayerStore((s) => s.currentTrack?.id === trackId && s.isPlaying);
}

// Progress (updates every 500ms — keep selectors cheap)
export function usePlayerProgress() {
  const progressSec = usePlayerStore((s) => s.progressSec);
  const durationSec = usePlayerStore((s) => s.durationSec);
  const seekTo      = usePlayerStore((s) => s.seekTo);
  const percent     = durationSec > 0 ? (progressSec / durationSec) * 100 : 0;
  const remaining   = Math.max(0, durationSec - progressSec);
  return { progressSec, durationSec, seekTo, percent, remaining };
}

// Volume (rarely changes)
export function usePlayerVolume() {
  const volume     = usePlayerStore((s) => s.volume);
  const isMuted    = usePlayerStore((s) => s.isMuted);
  const setVolume  = usePlayerStore((s) => s.setVolume);
  const toggleMute = usePlayerStore((s) => s.toggleMute);
  return { volume, isMuted, setVolume, toggleMute, effectiveVolume: isMuted ? 0 : volume };
}

// Queue
export function useQueue() {
  const queue           = usePlayerStore((s) => s.queue);
  const queueIndex      = usePlayerStore((s) => s.queueIndex);
  const addToQueue      = usePlayerStore((s) => s.addToQueue);
  const removeFromQueue = usePlayerStore((s) => s.removeFromQueue);
  const clearQueue      = usePlayerStore((s) => s.clearQueue);
  const moveQueueItem   = usePlayerStore((s) => s.moveQueueItem);
  return { queue, queueIndex, addToQueue, removeFromQueue, clearQueue, moveQueueItem };
}

// Recently played
export function useRecentlyPlayed() {
  const recentlyPlayed      = usePlayerStore((s) => s.recentlyPlayed);
  const clearRecentlyPlayed = usePlayerStore((s) => s.clearRecentlyPlayed);
  return { recentlyPlayed, clearRecentlyPlayed };
}

// Transport actions (stable references — never triggers re-renders)
export function usePlayerTransport() {
  const togglePlay    = usePlayerStore((s) => s.togglePlay);
  const play          = usePlayerStore((s) => s.play);
  const pause         = usePlayerStore((s) => s.pause);
  const resume        = usePlayerStore((s) => s.resume);
  const playNext      = usePlayerStore((s) => s.playNext);
  const playPrevious  = usePlayerStore((s) => s.playPrevious);
  const repeatMode    = usePlayerStore((s) => s.repeatMode);
  const isShuffled    = usePlayerStore((s) => s.isShuffled);
  const cycleRepeat   = usePlayerStore((s) => s.cycleRepeat);
  const toggleShuffle = usePlayerStore((s) => s.toggleShuffle);
  return {
    togglePlay, play, pause, resume,
    playNext, playPrevious,
    repeatMode, isShuffled, cycleRepeat, toggleShuffle,
  };
}

/**
 * usePlayTrack — convenience hook for track cards and rows.
 * Returns a stable `handlePlay` function and derived booleans.
 */
export function usePlayTrack(track: TrackResponse, queue?: TrackResponse[]) {
  const currentTrack = usePlayerStore((s) => s.currentTrack);
  const isPlaying    = usePlayerStore((s) => s.isPlaying);
  const play         = usePlayerStore((s) => s.play);
  const pause        = usePlayerStore((s) => s.pause);
  const resume       = usePlayerStore((s) => s.resume);

  const isCurrentTrack = currentTrack?.id === track.id;
  const isThisPlaying  = isCurrentTrack && isPlaying;

  const handlePlay = () => {
    if (isCurrentTrack) {
      isPlaying ? pause() : resume();
    } else {
      play(track, queue ?? [track]);
    }
  };

  return { isCurrentTrack, isThisPlaying, handlePlay };
}