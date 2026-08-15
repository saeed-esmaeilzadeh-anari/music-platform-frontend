'use client';

import { useEffect, useRef } from 'react';
import { initAudioEngine } from '@/lib/audio/audio-engine';
import { usePlayerStore } from '@/stores/player.store';
import { useAuthStore } from '@/stores/auth.store';
import { tracksService } from '@/services/tracks.service';
import { PLAY_REGISTER_THRESHOLD_SEC } from '@/lib/constants';

/**
 * AudioProvider
 *
 * Mount ONCE inside RootProviders — above all route layouts.
 *
 * Responsibilities:
 *   1. Boot the AudioEngine singleton on first client render
 *   2. Register POST /tracks/:id/play after PLAY_REGISTER_THRESHOLD_SEC seconds
 *   3. Register global keyboard shortcuts (no React state needed — pure DOM)
 */
export function AudioProvider({ children }: { children: React.ReactNode }) {
  const booted          = useRef(false);
  const registeredRef   = useRef<string | null>(null);

  // ── 1. Boot engine ────────────────────────────────────────────────────────
  useEffect(() => {
    if (booted.current) return;
    booted.current = true;
    initAudioEngine();
  }, []);

  // ── 2. Reset sentinel when track changes ──────────────────────────────────
  useEffect(() => {
    return usePlayerStore.subscribe((s, prev) => {
      if (s.currentTrack?.id !== prev.currentTrack?.id) {
        registeredRef.current = null;
      }
    });
  }, []);

  // ── 3. Fire POST /tracks/:id/play after threshold ─────────────────────────
  useEffect(() => {
    return usePlayerStore.subscribe((s) => {
      if (!s.currentTrack) return;
      if (s.progressSec < PLAY_REGISTER_THRESHOLD_SEC) return;
      const key = s.currentTrack.id;
      if (registeredRef.current === key) return;
      registeredRef.current = key;

      const { isAuthenticated } = useAuthStore.getState();
      if (!isAuthenticated) return;
      tracksService.registerPlay(key, { progressSec: Math.floor(s.progressSec) }).catch(() => {});
    });
  }, []);

  // ── 4. Global keyboard shortcuts ──────────────────────────────────────────
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || (e.target as HTMLElement).isContentEditable) return;

      const s = usePlayerStore.getState();

      switch (e.code) {
        case 'Space':
          e.preventDefault(); s.togglePlay(); break;
        case 'ArrowRight':
          if (e.shiftKey) { e.preventDefault(); s.playNext(); }
          else if (e.altKey) { e.preventDefault(); s.seekTo(Math.min(s.progressSec + 10, s.durationSec)); }
          break;
        case 'ArrowLeft':
          if (e.shiftKey) { e.preventDefault(); s.playPrevious(); }
          else if (e.altKey) { e.preventDefault(); s.seekTo(Math.max(s.progressSec - 10, 0)); }
          break;
        case 'ArrowUp':
          if (e.altKey) { e.preventDefault(); s.setVolume(Math.min(s.volume + 0.1, 1)); }
          break;
        case 'ArrowDown':
          if (e.altKey) { e.preventDefault(); s.setVolume(Math.max(s.volume - 0.1, 0)); }
          break;
        case 'KeyM': e.preventDefault(); s.toggleMute(); break;
        case 'KeyS': if (e.altKey) { e.preventDefault(); s.toggleShuffle(); } break;
        case 'KeyR': if (e.altKey) { e.preventDefault(); s.cycleRepeat(); } break;
      }
    };

    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return <>{children}</>;
}
