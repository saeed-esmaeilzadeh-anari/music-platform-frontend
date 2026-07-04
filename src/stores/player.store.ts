/**
 * Zustand Player Store
 * Global music player state — the "now playing" bar at the bottom of the app.
 * When a track is played, we call POST /tracks/:id/play (via tracks.service.ts)
 * to register it in the backend's listening history.
 */

import { create } from "zustand";
import { devtools } from "zustand/middleware";
import type { TrackResponse } from "@/types";

export type RepeatMode = "none" | "one" | "all";

interface PlayerState {
  // Current track
  currentTrack: TrackResponse | null;
  queue: TrackResponse[];
  queueIndex: number;

  // Playback state
  isPlaying: boolean;
  volume: number; // 0–1
  isMuted: boolean;
  progressSec: number;
  durationSec: number;
  repeatMode: RepeatMode;
  isShuffled: boolean;

  // Actions
  play: (track: TrackResponse, queue?: TrackResponse[]) => void;
  pause: () => void;
  resume: () => void;
  togglePlay: () => void;
  setTrack: (track: TrackResponse) => void;
  playNext: () => void;
  playPrevious: () => void;
  setProgress: (sec: number) => void;
  setDuration: (sec: number) => void;
  setVolume: (vol: number) => void;
  toggleMute: () => void;
  toggleShuffle: () => void;
  cycleRepeat: () => void;
  addToQueue: (track: TrackResponse) => void;
  clearQueue: () => void;
}

export const usePlayerStore = create<PlayerState>()(
  devtools(
    (set, get) => ({
      currentTrack: null,
      queue: [],
      queueIndex: -1,
      isPlaying: false,
      volume: 0.8,
      isMuted: false,
      progressSec: 0,
      durationSec: 0,
      repeatMode: "none",
      isShuffled: false,

      play: (track, queue) => {
        const newQueue = queue ?? [track];
        const idx = newQueue.findIndex((t) => t.id === track.id);
        set(
          {
            currentTrack: track,
            queue: newQueue,
            queueIndex: idx >= 0 ? idx : 0,
            isPlaying: true,
            progressSec: 0,
          },
          false,
          "player/play"
        );
      },

      pause: () => set({ isPlaying: false }, false, "player/pause"),

      resume: () => set({ isPlaying: true }, false, "player/resume"),

      togglePlay: () => {
        const { isPlaying } = get();
        set({ isPlaying: !isPlaying }, false, "player/togglePlay");
      },

      setTrack: (track) =>
        set({ currentTrack: track, progressSec: 0 }, false, "player/setTrack"),

      playNext: () => {
        const { queue, queueIndex, repeatMode, isShuffled } = get();
        if (!queue.length) return;

        let nextIndex: number;
        if (isShuffled) {
          nextIndex = Math.floor(Math.random() * queue.length);
        } else if (queueIndex < queue.length - 1) {
          nextIndex = queueIndex + 1;
        } else if (repeatMode === "all") {
          nextIndex = 0;
        } else {
          set({ isPlaying: false }, false, "player/playNext/end");
          return;
        }

        set(
          {
            currentTrack: queue[nextIndex],
            queueIndex: nextIndex,
            progressSec: 0,
            isPlaying: true,
          },
          false,
          "player/playNext"
        );
      },

      playPrevious: () => {
        const { queue, queueIndex, progressSec } = get();
        // Restart current track if more than 3 seconds in
        if (progressSec > 3) {
          set({ progressSec: 0 }, false, "player/restart");
          return;
        }
        if (queueIndex <= 0) {
          set({ progressSec: 0 }, false, "player/restart");
          return;
        }
        const prevIndex = queueIndex - 1;
        set(
          {
            currentTrack: queue[prevIndex],
            queueIndex: prevIndex,
            progressSec: 0,
            isPlaying: true,
          },
          false,
          "player/playPrevious"
        );
      },

      setProgress: (sec) =>
        set({ progressSec: sec }, false, "player/setProgress"),

      setDuration: (sec) =>
        set({ durationSec: sec }, false, "player/setDuration"),

      setVolume: (vol) =>
        set(
          { volume: Math.max(0, Math.min(1, vol)), isMuted: false },
          false,
          "player/setVolume"
        ),

      toggleMute: () => {
        const { isMuted } = get();
        set({ isMuted: !isMuted }, false, "player/toggleMute");
      },

      toggleShuffle: () => {
        const { isShuffled } = get();
        set({ isShuffled: !isShuffled }, false, "player/toggleShuffle");
      },

      cycleRepeat: () => {
        const { repeatMode } = get();
        const next: RepeatMode =
          repeatMode === "none" ? "all" : repeatMode === "all" ? "one" : "none";
        set({ repeatMode: next }, false, "player/cycleRepeat");
      },

      addToQueue: (track) => {
        const { queue } = get();
        set({ queue: [...queue, track] }, false, "player/addToQueue");
      },

      clearQueue: () =>
        set(
          { queue: [], queueIndex: -1, currentTrack: null, isPlaying: false },
          false,
          "player/clearQueue"
        ),
    }),
    { name: "PlayerStore" }
  )
);
