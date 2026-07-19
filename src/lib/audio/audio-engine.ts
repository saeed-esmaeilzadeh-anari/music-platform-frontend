/**
 * AudioEngine — singleton that owns the HTMLAudioElement.
 *
 * Subscribes to usePlayerStore and drives real audio playback.
 * Writes currentTime / duration / loading state back to the store.
 *
 * Seek detection: we use a dedicated `_seekTarget` field on the store
 * snapshot. When `seekTo(sec)` is called, the store sets `progressSec`
 * to `sec`. The engine sees `|store.progressSec - audio.currentTime| > 1`
 * combined with the fact it wasn't a natural timeupdate tick → seeks.
 * We gate this with `isSeeking` to prevent the resulting `seeked` event
 * from triggering another seek.
 */

import { usePlayerStore } from '@/stores/player.store';

class AudioEngine {
  private audio: HTMLAudioElement;
  private unsubscribe: (() => void) | null = null;

  // Snapshot of last-acted values
  private lastTrackId: string | null = null;
  private lastIsPlaying = false;
  private lastVolume = 0.8;
  private lastIsMuted = false;
  private lastRepeatMode = 'none';

  // Seek management
  private isSeeking = false;
  private lastAppliedSeek = -1;

  constructor() {
    this.audio = typeof window !== 'undefined' ? new Audio() : ({} as HTMLAudioElement);
    if (typeof window === 'undefined') return;

    this.audio.preload = 'metadata';

    this.bindEvents();
    this.subscribeToStore();

    // Apply persisted volume immediately
    const { volume, isMuted } = usePlayerStore.getState();
    this.audio.volume = isMuted ? 0 : volume;
    this.audio.muted = isMuted;
  }

  // ── HTMLAudioElement event → store ────────────────────────────────────────

  private bindEvents() {
    const getStore = () => usePlayerStore.getState();

    this.audio.addEventListener('timeupdate', () => {
      if (!this.isSeeking) {
        getStore().setProgress(this.audio.currentTime);
      }
    });

    this.audio.addEventListener('durationchange', () => {
      const d = this.audio.duration;
      if (d && isFinite(d)) getStore().setDuration(d);
    });

    this.audio.addEventListener('waiting',  () => getStore().setIsLoading(true));
    this.audio.addEventListener('canplay',  () => getStore().setIsLoading(false));
    this.audio.addEventListener('playing',  () => getStore().setIsLoading(false));
    this.audio.addEventListener('seeked',   () => { this.isSeeking = false; });

    this.audio.addEventListener('ended', () => {
      getStore().playNext();
    });

    this.audio.addEventListener('error', () => {
      getStore().setIsLoading(false);
    });
  }

  // ── Store → HTMLAudioElement ──────────────────────────────────────────────

  private subscribeToStore() {
    this.unsubscribe = usePlayerStore.subscribe((state) => {
      // ── New track ──────────────────────────────────────────────────────────
      const trackId = state.currentTrack?.id ?? null;
      if (trackId !== this.lastTrackId) {
        this.lastTrackId = trackId;
        this.lastAppliedSeek = -1;
        this.isSeeking = false;

        if (state.currentTrack?.audioUrl) {
          this.audio.src = state.currentTrack.audioUrl;
          this.audio.load();
          if (state.isPlaying) this.safePlay();
        } else {
          // No audio URL (DRAFT/PROCESSING) — reset
          this.audio.removeAttribute('src');
          this.audio.load();
        }
        return; // don't process other changes on same tick as track load
      }

      // ── Play / pause ───────────────────────────────────────────────────────
      if (state.isPlaying !== this.lastIsPlaying) {
        this.lastIsPlaying = state.isPlaying;
        if (state.isPlaying) {
          this.safePlay();
        } else {
          this.audio.pause();
        }
      }

      // ── Volume / mute ──────────────────────────────────────────────────────
      if (state.volume !== this.lastVolume || state.isMuted !== this.lastIsMuted) {
        this.lastVolume = state.volume;
        this.lastIsMuted = state.isMuted;
        this.audio.volume = state.isMuted ? 0 : Math.max(0, Math.min(1, state.volume));
        this.audio.muted = state.isMuted;
      }

      // ── Seek: only when progressSec changed significantly from audio.currentTime ─
      // This detects a seekTo() call vs a natural timeupdate.
      if (
        !this.isSeeking &&
        Math.abs(state.progressSec - this.audio.currentTime) > 1.5 &&
        state.progressSec !== this.lastAppliedSeek &&
        isFinite(state.progressSec)
      ) {
        this.lastAppliedSeek = state.progressSec;
        this.isSeeking = true;
        this.audio.currentTime = state.progressSec;
      }

      // ── Repeat one → loop attribute ────────────────────────────────────────
      if (state.repeatMode !== this.lastRepeatMode) {
        this.lastRepeatMode = state.repeatMode;
        this.audio.loop = state.repeatMode === 'one';
      }
    });
  }

  private async safePlay(): Promise<void> {
    try {
      await this.audio.play();
    } catch (err) {
      if ((err as DOMException)?.name === 'NotAllowedError') {
        // Browser blocked autoplay — keep store in sync
        usePlayerStore.getState().pause();
      } else if ((err as DOMException)?.name !== 'AbortError') {
        // AbortError is expected when src changes mid-play; ignore it
        console.warn('[AudioEngine] play() error:', err);
      }
    }
  }

  destroy() {
    this.unsubscribe?.();
    this.audio.pause();
    this.audio.src = '';
  }
}

let engine: AudioEngine | null = null;

export function initAudioEngine(): AudioEngine {
  if (typeof window === 'undefined') {
    throw new Error('AudioEngine must be created in a browser context');
  }
  if (!engine) engine = new AudioEngine();
  return engine;
}

export function getAudioEngine(): AudioEngine | null {
  return engine;
}
