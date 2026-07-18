'use client';

import { useEffect, useRef } from 'react';
import { initAudioEngine } from '@/lib/audio/audio-engine';
import { usePlayerStore } from '@/stores/player.store';
import { useAuthStore } from '@/stores/auth.store';
import { useRegisterPlay } from '@/hooks/use-tracks';
import { PLAY_REGISTER_THRESHOLD_SEC } from '@/lib/constants';

/**
 * AudioProvider
 *
 * Mount once inside RootProviders (above the route group layouts).
 * Responsibilities:
 *   1. Boot the AudioEngine singleton on first client render.
 *   2. Register global keyboard shortcuts (Space, arrows, M, S, R, L).
 *   3. Call POST /tracks/:id/play after PLAY_REGISTER_THRESHOLD_SEC seconds
 *      of uninterrupted playback (backend listening history + play count).
 */
export function AudioProvider({ children }: { children: React.ReactNode }) {
  const hasBooted = useRef(false);
  const registerPlay = useRegisterPlay();
  const hasRegisteredRef = useRef<string | null>(null);

  // ── Boot engine ─────────────────────────────────────────────────────────────
  useEffect(() => {
    if (hasBooted.current) return;
    hasBooted.current = true;
    initAudioEngine();
  }, []);

  // ── API play registration ────────────────────────────────────────────────────
  useEffect(() => {
    const unsub = usePlayerStore.subscribe((state) => {
      const { isAuthenticated } = useAuthStore.getState();
      if (!isAuthenticated) return;
      if (!state.currentTrack) return;
      if (state.progressSec < PLAY_REGISTER_THRESHOLD_SEC) return;

      // Only fire once per track session
      const key = state.currentTrack.id;
      if (hasRegisteredRef.current === key) return;
      hasRegisteredRef.current = key;

      registerPlay.mutate({ id: key, progressSec: Math.floor(state.progressSec) });
    });

    return unsub;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Reset registration sentinel when track changes ────────────────────────
  useEffect(() => {
    const unsub = usePlayerStore.subscribe((state, prev) => {
      if (state.currentTrack?.id !== prev.currentTrack?.id) {
        hasRegisteredRef.current = null;
      }
    });
    return unsub;
  }, []);

  // ── Keyboard shortcuts ───────────────────────────────────────────────────────
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      // Ignore when typing in an input / textarea / contenteditable
      const target = e.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      ) return;

      const store = usePlayerStore.getState();

      switch (e.code) {
        case 'Space':
          e.preventDefault();
          store.togglePlay();
          break;

        case 'ArrowRight':
          if (e.shiftKey) {
            e.preventDefault();
            store.playNext();
          } else if (e.altKey) {
            e.preventDefault();
            store.seekTo(Math.min(store.progressSec + 10, store.durationSec));
          }
          break;

        case 'ArrowLeft':
          if (e.shiftKey) {
            e.preventDefault();
            store.playPrevious();
          } else if (e.altKey) {
            e.preventDefault();
            store.seekTo(Math.max(store.progressSec - 10, 0));
          }
          break;

        case 'ArrowUp':
          if (e.altKey) {
            e.preventDefault();
            store.setVolume(Math.min(store.volume + 0.1, 1));
          }
          break;

        case 'ArrowDown':
          if (e.altKey) {
            e.preventDefault();
            store.setVolume(Math.max(store.volume - 0.1, 0));
          }
          break;

        case 'KeyM':
          e.preventDefault();
          store.toggleMute();
          break;

        case 'KeyS':
          if (e.altKey) {
            e.preventDefault();
            store.toggleShuffle();
          }
          break;

        case 'KeyR':
          if (e.altKey) {
            e.preventDefault();
            store.cycleRepeat();
          }
          break;
      }
    };

    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return <>{children}</>;
}