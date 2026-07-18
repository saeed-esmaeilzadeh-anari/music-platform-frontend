/**
 * AudioEngine
 *
 * A singleton that owns ONE HTMLAudioElement for the lifetime of the app.
 * It subscribes to usePlayerStore and reacts to state changes:
 *   - currentTrack changes  → load & play new src
 *   - isPlaying changes     → audio.play() / audio.pause()
 *   - volume/isMuted        → audio.volume
 *   - seekTo                → audio.currentTime (distinguished from passive setProgress)
 *   - repeatMode === 'one'  → loop attribute
 *
 * It also writes back to the store:
 *   - ontimeupdate          → setProgress(audio.currentTime)
 *   - ondurationchange      → setDuration(audio.duration)
 *   - onwaiting/oncanplay   → setIsLoading(true/false)
 *   - onended               → playNext()
 *   - onerror               → setIsLoading(false)
 *
 * Nothing else in the app touches HTMLAudioElement directly.
 * Components dispatch actions to the store → engine reacts → engine updates DOM.
 */

import { usePlayerStore } from '@/stores/player.store';

class AudioEngine {
  private audio: HTMLAudioElement;
  private unsubscribe: (() => void) | null = null;

  // Track the last values we acted on to avoid redundant operations
  private lastTrackId: string | null = null;
  private lastIsPlaying: boolean = false;
  private lastVolume: number = 0.8;
  private lastIsMuted: boolean = false;
  private lastSeekSec: number = -1;
  private lastRepeatMode: string = 'none';
  private isSeeking: boolean = false;

  constructor() {
    this.audio = new Audio();
    this.audio.preload = 'metadata';
    this.audio.crossOrigin = 'anonymous';

    this.bindAudioEvents();
    this.subscribeTo();
  }

  // ── Bind HTMLAudioElement events → store writes ────────────────────────────

  private bindAudioEvents() {
    const store = usePlayerStore;

    this.audio.addEventListener('timeupdate', () => {
      if (!this.isSeeking) {
        store.getState().setProgress(this.audio.currentTime);
      }
    });

    this.audio.addEventListener('durationchange', () => {
      const dur = this.audio.duration;
      if (dur && isFinite(dur)) {
        store.getState().setDuration(dur);
      }
    });

    this.audio.addEventListener('waiting', () => {
      store.getState().setIsLoading(true);
    });

    this.audio.addEventListener('canplay', () => {
      store.getState().setIsLoading(false);
    });

    this.audio.addEventListener('playing', () => {
      store.getState().setIsLoading(false);
    });

    this.audio.addEventListener('ended', () => {
      store.getState().playNext();
    });

    this.audio.addEventListener('error', (e) => {
      console.warn('[AudioEngine] playback error', e);
      store.getState().setIsLoading(false);
    });

    this.audio.addEventListener('seeked', () => {
      this.isSeeking = false;
    });
  }

  // ── Subscribe to store → drive HTMLAudioElement ────────────────────────────

  private subscribeTo() {
    this.unsubscribe = usePlayerStore.subscribe((state, prev) => {
      // ── Track changed → load new src ────────────────────────────────────────
      const trackId = state.currentTrack?.id ?? null;
      if (trackId !== this.lastTrackId) {
        this.lastTrackId = trackId;
        this.lastSeekSec = -1;

        if (state.currentTrack?.audioUrl) {
          this.audio.src = state.currentTrack.audioUrl;
          this.audio.load();
          if (state.isPlaying) {
            this.safePlay();
          }
        } else {
          // Track has no audio yet (DRAFT/PROCESSING) — reset
          this.audio.removeAttribute('src');
          this.audio.load();
        }
      }

      // ── isPlaying changed ────────────────────────────────────────────────────
      if (state.isPlaying !== this.lastIsPlaying) {
        this.lastIsPlaying = state.isPlaying;
        if (state.isPlaying) {
          this.safePlay();
        } else {
          this.audio.pause();
        }
      }

      // ── volume / mute ─────────────────────────────────────────────────────────
      if (state.volume !== this.lastVolume || state.isMuted !== this.lastIsMuted) {
        this.lastVolume = state.volume;
        this.lastIsMuted = state.isMuted;
        this.audio.volume = state.isMuted ? 0 : state.volume;
        this.audio.muted = state.isMuted;
      }

      // ── Explicit seek (seekTo action, not passive setProgress) ───────────────
      // We detect this by comparing progressSec with a tolerance — if it changed
      // by more than 1s and audio.currentTime doesn't match, it's a seek intent.
      const storeSec = state.progressSec;
      const audiSec = this.audio.currentTime;
      if (Math.abs(storeSec - audiSec) > 1.5 && storeSec !== this.lastSeekSec && !this.isSeeking) {
        this.lastSeekSec = storeSec;
        this.isSeeking = true;
        this.audio.currentTime = storeSec;
      }

      // ── Repeat mode ───────────────────────────────────────────────────────────
      if (state.repeatMode !== this.lastRepeatMode) {
        this.lastRepeatMode = state.repeatMode;
        this.audio.loop = state.repeatMode === 'one';
      }
    });
  }

  private async safePlay() {
    try {
      await this.audio.play();
    } catch (err) {
      // Browser may block autoplay — pause the store so UI stays consistent
      if ((err as DOMException)?.name === 'NotAllowedError') {
        usePlayerStore.getState().pause();
      }
    }
  }

  destroy() {
    this.unsubscribe?.();
    this.audio.pause();
    this.audio.src = '';
  }
}

// Singleton — created once, lives for the app lifetime
let engine: AudioEngine | null = null;

export function initAudioEngine(): AudioEngine {
  if (typeof window === 'undefined') {
    throw new Error('AudioEngine must only be created in a browser context');
  }
  if (!engine) {
    engine = new AudioEngine();
  }
  return engine;
}

export function getAudioEngine(): AudioEngine | null {
  return engine;
}