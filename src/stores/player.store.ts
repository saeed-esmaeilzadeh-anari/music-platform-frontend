/**
 * Player Store — single source of truth for all playback state.
 *
 * The AudioEngine (src/lib/audio/audio-engine.ts) subscribes to this store
 * and drives the real HTMLAudioElement. It also writes currentTime/duration
 * back here. Components only talk to this store — never to audio directly.
 *
 * Extensions over the original:
 *  - persist middleware: survives page refresh (currentTrack, queue, volume, etc.)
 *  - recentlyPlayed: ring-buffer capped at 50 tracks (POST /tracks/:id/play fires separately)
 *  - seekTo: explicit seek action (distinct from setProgress which is a passive write)
 *  - setIsLoading / isLoading: loading state while audio fetches/decodes
 */

import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import type { TrackResponse } from '@/types';

export type RepeatMode = 'none' | 'one' | 'all';

const RECENTLY_PLAYED_MAX = 50;

interface PlayerState {
  // ── Current track ──────────────────────────────────────────
  currentTrack: TrackResponse | null;
  queue: TrackResponse[];
  queueIndex: number;
  recentlyPlayed: TrackResponse[];

  // ── Playback state ─────────────────────────────────────────
  isPlaying: boolean;
  isLoading: boolean;        // buffering / waiting for audio
  volume: number;            // 0–1
  isMuted: boolean;
  progressSec: number;       // current playback position
  durationSec: number;       // total duration
  repeatMode: RepeatMode;
  isShuffled: boolean;
  shuffledIndices: number[]; // shuffled order when isShuffled=true

  // ── Actions ────────────────────────────────────────────────
  play: (track: TrackResponse, queue?: TrackResponse[]) => void;
  pause: () => void;
  resume: () => void;
  togglePlay: () => void;
  setTrack: (track: TrackResponse) => void;
  playNext: () => void;
  playPrevious: () => void;
  seekTo: (sec: number) => void;          // intentional seek (drives audio)
  setProgress: (sec: number) => void;     // passive write from audio timeupdate
  setDuration: (sec: number) => void;
  setIsLoading: (v: boolean) => void;
  setVolume: (vol: number) => void;
  toggleMute: () => void;
  toggleShuffle: () => void;
  cycleRepeat: () => void;
  addToQueue: (track: TrackResponse) => void;
  removeFromQueue: (index: number) => void;
  clearQueue: () => void;
  moveQueueItem: (from: number, to: number) => void;
  addToRecentlyPlayed: (track: TrackResponse) => void;
  clearRecentlyPlayed: () => void;
}

function buildShuffledIndices(length: number, currentIndex: number): number[] {
  const indices = Array.from({ length }, (_, i) => i).filter((i) => i !== currentIndex);
  for (let i = indices.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [indices[i], indices[j]] = [indices[j], indices[i]];
  }
  return [currentIndex, ...indices];
}

export const usePlayerStore = create<PlayerState>()(
  devtools(
    persist(
      (set, get) => ({
        // ── Initial state ──────────────────────────────────────
        currentTrack: null,
        queue: [],
        queueIndex: -1,
        recentlyPlayed: [],
        isPlaying: false,
        isLoading: false,
        volume: 0.8,
        isMuted: false,
        progressSec: 0,
        durationSec: 0,
        repeatMode: 'none',
        isShuffled: false,
        shuffledIndices: [],

        // ── play ───────────────────────────────────────────────
        play: (track, queue) => {
          const newQueue = queue ?? [track];
          const idx = newQueue.findIndex((t) => t.id === track.id);
          const resolvedIdx = idx >= 0 ? idx : 0;

          set(
            {
              currentTrack: track,
              queue: newQueue,
              queueIndex: resolvedIdx,
              isPlaying: true,
              isLoading: true,
              progressSec: 0,
              durationSec: 0,
              shuffledIndices: get().isShuffled
                ? buildShuffledIndices(newQueue.length, resolvedIdx)
                : [],
            },
            false,
            'player/play',
          );

          // Add to recently played immediately (ring buffer)
          get().addToRecentlyPlayed(track);
        },

        // ── pause / resume / toggle ────────────────────────────
        pause: () => set({ isPlaying: false }, false, 'player/pause'),
        resume: () => set({ isPlaying: true }, false, 'player/resume'),
        togglePlay: () => set(
          (s) => ({ isPlaying: !s.isPlaying }),
          false,
          'player/togglePlay',
        ),

        setTrack: (track) =>
          set({ currentTrack: track, progressSec: 0, isLoading: true }, false, 'player/setTrack'),

        // ── playNext ───────────────────────────────────────────
        playNext: () => {
          const { queue, queueIndex, repeatMode, isShuffled, shuffledIndices } = get();
          if (!queue.length) return;

          if (repeatMode === 'one') {
            // Signal AudioEngine to restart — store stays, engine resets time
            set({ progressSec: 0, isLoading: true }, false, 'player/repeatOne');
            return;
          }

          let nextIndex: number;
          if (isShuffled && shuffledIndices.length) {
            const currentPos = shuffledIndices.indexOf(queueIndex);
            const nextPos = (currentPos + 1) % shuffledIndices.length;
            nextIndex = shuffledIndices[nextPos];
          } else if (queueIndex < queue.length - 1) {
            nextIndex = queueIndex + 1;
          } else if (repeatMode === 'all') {
            nextIndex = 0;
          } else {
            set({ isPlaying: false }, false, 'player/playNext/end');
            return;
          }

          const nextTrack = queue[nextIndex];
          set(
            { currentTrack: nextTrack, queueIndex: nextIndex, progressSec: 0, isLoading: true, isPlaying: true },
            false,
            'player/playNext',
          );
          get().addToRecentlyPlayed(nextTrack);
        },

        // ── playPrevious ───────────────────────────────────────
        playPrevious: () => {
          const { queue, queueIndex, progressSec } = get();
          if (progressSec > 3) {
            set({ progressSec: 0, isLoading: false }, false, 'player/restart');
            return;
          }
          if (queueIndex <= 0) {
            set({ progressSec: 0 }, false, 'player/restart');
            return;
          }
          const prevIndex = queueIndex - 1;
          const prevTrack = queue[prevIndex];
          set(
            { currentTrack: prevTrack, queueIndex: prevIndex, progressSec: 0, isLoading: true, isPlaying: true },
            false,
            'player/playPrevious',
          );
          get().addToRecentlyPlayed(prevTrack);
        },

        // ── seek / progress / duration ─────────────────────────
        seekTo: (sec) => set({ progressSec: sec }, false, 'player/seekTo'),
        setProgress: (sec) => set({ progressSec: sec }, false, 'player/setProgress'),
        setDuration: (sec) => set({ durationSec: sec }, false, 'player/setDuration'),
        setIsLoading: (v) => set({ isLoading: v }, false, 'player/setIsLoading'),

        // ── volume ─────────────────────────────────────────────
        setVolume: (vol) =>
          set({ volume: Math.max(0, Math.min(1, vol)), isMuted: false }, false, 'player/setVolume'),
        toggleMute: () =>
          set((s) => ({ isMuted: !s.isMuted }), false, 'player/toggleMute'),

        // ── shuffle ────────────────────────────────────────────
        toggleShuffle: () => {
          const { isShuffled, queue, queueIndex } = get();
          const next = !isShuffled;
          set(
            {
              isShuffled: next,
              shuffledIndices: next ? buildShuffledIndices(queue.length, queueIndex) : [],
            },
            false,
            'player/toggleShuffle',
          );
        },

        // ── repeat ─────────────────────────────────────────────
        cycleRepeat: () => {
          const { repeatMode } = get();
          const next: RepeatMode =
            repeatMode === 'none' ? 'all' : repeatMode === 'all' ? 'one' : 'none';
          set({ repeatMode: next }, false, 'player/cycleRepeat');
        },

        // ── queue management ───────────────────────────────────
        addToQueue: (track) => {
          const { queue } = get();
          set({ queue: [...queue, track] }, false, 'player/addToQueue');
        },

        removeFromQueue: (index) => {
          const { queue, queueIndex } = get();
          const next = queue.filter((_, i) => i !== index);
          set(
            {
              queue: next,
              queueIndex: index < queueIndex ? queueIndex - 1 : queueIndex,
            },
            false,
            'player/removeFromQueue',
          );
        },

        clearQueue: () =>
          set(
            { queue: [], queueIndex: -1, currentTrack: null, isPlaying: false, progressSec: 0 },
            false,
            'player/clearQueue',
          ),

        moveQueueItem: (from, to) => {
          const { queue } = get();
          const next = [...queue];
          const [moved] = next.splice(from, 1);
          next.splice(to, 0, moved);
          set({ queue: next }, false, 'player/moveQueueItem');
        },

        // ── recently played ────────────────────────────────────
        addToRecentlyPlayed: (track) => {
          const { recentlyPlayed } = get();
          const filtered = recentlyPlayed.filter((t) => t.id !== track.id);
          set(
            { recentlyPlayed: [track, ...filtered].slice(0, RECENTLY_PLAYED_MAX) },
            false,
            'player/addToRecentlyPlayed',
          );
        },

        clearRecentlyPlayed: () =>
          set({ recentlyPlayed: [] }, false, 'player/clearRecentlyPlayed'),
      }),
      {
        name: 'ms-player',
        // Persist everything except ephemeral playback state
        partialize: (s) => ({
          currentTrack: s.currentTrack,
          queue: s.queue,
          queueIndex: s.queueIndex,
          recentlyPlayed: s.recentlyPlayed,
          volume: s.volume,
          isMuted: s.isMuted,
          repeatMode: s.repeatMode,
          isShuffled: s.isShuffled,
          shuffledIndices: s.shuffledIndices,
          // NOTE: isPlaying is NOT persisted — restore as paused
        }),
      },
    ),
    { name: 'PlayerStore' },
  ),
);
