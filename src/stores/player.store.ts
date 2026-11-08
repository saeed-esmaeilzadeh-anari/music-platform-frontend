/**
 * Player Store — extended from original architecture.
 *
 * New additions (non-breaking):
 *   - persist middleware: survives page refresh
 *   - seekTo(sec): intent-based seek (engine detects vs passive setProgress)
 *   - isLoading: buffering state
 *   - recentlyPlayed: ring-buffer capped at 50
 *   - removeFromQueue / moveQueueItem
 *   - shuffledIndices: pre-computed shuffle order
 */

import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import type { TrackResponse } from '@/types';

export type RepeatMode = 'none' | 'one' | 'all';

const RECENTLY_PLAYED_MAX = 50;

function buildShuffledIndices(length: number, currentIdx: number): number[] {
  const rest = Array.from({ length }, (_, i) => i).filter(i => i !== currentIdx);
  for (let i = rest.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [rest[i], rest[j]] = [rest[j], rest[i]];
  }
  return [currentIdx, ...rest];
}

interface PlayerState {
  // Track / queue
  currentTrack:     TrackResponse | null;
  queue:            TrackResponse[];
  queueIndex:       number;
  recentlyPlayed:   TrackResponse[];
  shuffledIndices:  number[];

  // Playback
  isPlaying:    boolean;
  isLoading:    boolean;
  volume:       number;
  isMuted:      boolean;
  progressSec:  number;
  durationSec:  number;
  repeatMode:   RepeatMode;
  isShuffled:   boolean;

  // Actions — original API preserved exactly
  play:          (track: TrackResponse, queue?: TrackResponse[]) => void;
  pause:         () => void;
  resume:        () => void;
  togglePlay:    () => void;
  setTrack:      (track: TrackResponse) => void;
  playNext:      () => void;
  playPrevious:  () => void;
  setProgress:   (sec: number) => void;
  setDuration:   (sec: number) => void;
  setVolume:     (vol: number) => void;
  toggleMute:    () => void;
  toggleShuffle: () => void;
  cycleRepeat:   () => void;
  addToQueue:    (track: TrackResponse) => void;
  clearQueue:    () => void;

  // New actions
  seekTo:              (sec: number) => void;
  setIsLoading:        (v: boolean) => void;
  removeFromQueue:     (index: number) => void;
  moveQueueItem:       (from: number, to: number) => void;
  addToRecentlyPlayed: (track: TrackResponse) => void;
  clearRecentlyPlayed: () => void;
}

export const usePlayerStore = create<PlayerState>()(
  devtools(
    persist(
      (set, get) => ({
        // ── Initial state ────────────────────────────────────────────────────
        currentTrack:    null,
        queue:           [],
        queueIndex:      -1,
        recentlyPlayed:  [],
        shuffledIndices: [],
        isPlaying:       false,
        isLoading:       false,
        volume:          0.8,
        isMuted:         false,
        progressSec:     0,
        durationSec:     0,
        repeatMode:      'none',
        isShuffled:      false,

        // ── play ──────────────────────────────────────────────────────────────
        play: (track, queue) => {
          const newQueue = queue ?? [track];
          const idx      = newQueue.findIndex(t => t.id === track.id);
          const resolved = idx >= 0 ? idx : 0;

          set({
            currentTrack:    track,
            queue:           newQueue,
            queueIndex:      resolved,
            isPlaying:       true,
            isLoading:       true,
            progressSec:     0,
            durationSec:     0,
            shuffledIndices: get().isShuffled
              ? buildShuffledIndices(newQueue.length, resolved)
              : [],
          }, false, 'player/play');

          get().addToRecentlyPlayed(track);
        },

        pause:      () => set({ isPlaying: false },  false, 'player/pause'),
        resume:     () => set({ isPlaying: true },   false, 'player/resume'),
        togglePlay: () => set(s => ({ isPlaying: !s.isPlaying }), false, 'player/togglePlay'),
        setTrack:   (track) => set({ currentTrack: track, progressSec: 0, isLoading: true }, false, 'player/setTrack'),

        // ── playNext ──────────────────────────────────────────────────────────
        playNext: () => {
          const { queue, queueIndex, repeatMode, isShuffled, shuffledIndices } = get();
          if (!queue.length) return;

          if (repeatMode === 'one') {
            set({ progressSec: 0, isLoading: true }, false, 'player/repeatOne');
            return;
          }

          let nextIndex: number;
          if (isShuffled && shuffledIndices.length) {
            const pos = shuffledIndices.indexOf(queueIndex);
            nextIndex  = shuffledIndices[(pos + 1) % shuffledIndices.length];
          } else if (queueIndex < queue.length - 1) {
            nextIndex = queueIndex + 1;
          } else if (repeatMode === 'all') {
            nextIndex = 0;
          } else {
            set({ isPlaying: false }, false, 'player/end');
            return;
          }

          const next = queue[nextIndex];
          set({ currentTrack: next, queueIndex: nextIndex, progressSec: 0, isLoading: true, isPlaying: true }, false, 'player/playNext');
          get().addToRecentlyPlayed(next);
        },

        // ── playPrevious ──────────────────────────────────────────────────────
        playPrevious: () => {
          const { queue, queueIndex, progressSec } = get();
          if (progressSec > 3) { set({ progressSec: 0 }, false, 'player/restart'); return; }
          if (queueIndex <= 0) { set({ progressSec: 0 }, false, 'player/restart'); return; }
          const prevIndex = queueIndex - 1;
          const prev      = queue[prevIndex];
          set({ currentTrack: prev, queueIndex: prevIndex, progressSec: 0, isLoading: true, isPlaying: true }, false, 'player/playPrevious');
          get().addToRecentlyPlayed(prev);
        },

        setProgress:  (sec) => set({ progressSec: sec },  false, 'player/setProgress'),
        setDuration:  (sec) => set({ durationSec: sec },  false, 'player/setDuration'),
        setIsLoading: (v)   => set({ isLoading: v },      false, 'player/setIsLoading'),
        seekTo:       (sec) => set({ progressSec: sec },  false, 'player/seekTo'),

        setVolume: (vol) => set({ volume: Math.max(0, Math.min(1, vol)), isMuted: false }, false, 'player/setVolume'),
        toggleMute: () => set(s => ({ isMuted: !s.isMuted }), false, 'player/toggleMute'),

        toggleShuffle: () => {
          const { isShuffled, queue, queueIndex } = get();
          const next = !isShuffled;
          set({
            isShuffled:      next,
            shuffledIndices: next ? buildShuffledIndices(queue.length, queueIndex) : [],
          }, false, 'player/toggleShuffle');
        },

        cycleRepeat: () => {
          const order: RepeatMode[] = ['none', 'all', 'one'];
          const next = order[(order.indexOf(get().repeatMode) + 1) % order.length];
          set({ repeatMode: next }, false, 'player/cycleRepeat');
        },

        addToQueue: (track) => set(s => ({ queue: [...s.queue, track] }), false, 'player/addToQueue'),

        removeFromQueue: (index) => {
          const state = get();
          if (index < 0 || index >= state.queue.length) return;

          const next = state.queue.filter((_, i) => i !== index);
          if (next.length === 0) {
            set({
              queue: [],
              queueIndex: -1,
              currentTrack: null,
              progressSec: 0,
              durationSec: 0,
              isPlaying: false,
              isLoading: false,
              shuffledIndices: [],
            }, false, 'player/removeQueueLastItem');
            return;
          }

          if (index === state.queueIndex) {
            const nextIndex = Math.min(index, next.length - 1);
            const nextTrack = next[nextIndex];
            set({
              queue: next,
              queueIndex: nextIndex,
              currentTrack: nextTrack,
              progressSec: 0,
              durationSec: 0,
              isPlaying: true,
              isLoading: true,
              shuffledIndices: state.isShuffled
                ? buildShuffledIndices(next.length, nextIndex)
                : [],
            }, false, 'player/removeCurrentQueueItem');
            return;
          }

          const nextIndex = index < state.queueIndex ? state.queueIndex - 1 : state.queueIndex;
          set({
            queue: next,
            queueIndex: nextIndex,
            shuffledIndices: state.isShuffled
              ? buildShuffledIndices(next.length, nextIndex)
              : [],
          }, false, 'player/removeFromQueue');
        },

        moveQueueItem: (from, to) => {
          const state = get();
          if (
            from < 0 || from >= state.queue.length ||
            to < 0 || to >= state.queue.length ||
            from === to
          ) return;

          const next = [...state.queue];
          const [moved] = next.splice(from, 1);
          next.splice(to, 0, moved);

          // Keep the same track playing after reordering the queue.
          const nextIndex = state.currentTrack
            ? next.findIndex(track => track.id === state.currentTrack?.id)
            : state.queueIndex;
          set({
            queue: next,
            queueIndex: nextIndex,
            shuffledIndices: state.isShuffled
              ? buildShuffledIndices(next.length, nextIndex)
              : [],
          }, false, 'player/moveQueueItem');
        },

        clearQueue: () => set({
          queue: [],
          queueIndex: -1,
          currentTrack: null,
          isPlaying: false,
          isLoading: false,
          progressSec: 0,
          durationSec: 0,
          shuffledIndices: [],
        }, false, 'player/clearQueue'),

        addToRecentlyPlayed: (track) => {
          const filtered = get().recentlyPlayed.filter(t => t.id !== track.id);
          set({ recentlyPlayed: [track, ...filtered].slice(0, RECENTLY_PLAYED_MAX) }, false, 'player/addRecent');
        },

        clearRecentlyPlayed: () => set({ recentlyPlayed: [] }, false, 'player/clearRecent'),
      }),
      {
        name: 'ms-player',
        // Persist preferences and current track — NOT ephemeral playback state
        partialize: (s) => ({
          currentTrack:   s.currentTrack,
          queue:          s.queue,
          queueIndex:     s.queueIndex,
          recentlyPlayed: s.recentlyPlayed,
          volume:         s.volume,
          isMuted:        s.isMuted,
          repeatMode:     s.repeatMode,
          isShuffled:     s.isShuffled,
          shuffledIndices:s.shuffledIndices,
          // isPlaying intentionally NOT persisted — restore as paused
        }),
      },
    ),
    { name: 'PlayerStore' },
  ),
);
