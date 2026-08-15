/**
 * AudioEngine — singleton HTMLAudioElement driver.
 *
 * Subscribes to usePlayerStore and drives a single <audio> element.
 * Writes currentTime / duration / loading state back to the store.
 *
 * Seek detection: when store.progressSec differs from audio.currentTime
 * by more than 1.5 s AND the gap wasn't caused by a natural timeupdate tick,
 * we treat it as an intentional seekTo() call and set audio.currentTime.
 * A `isSeeking` flag prevents the resulting `seeked` event from looping.
 */

import { usePlayerStore } from '@/stores/player.store';

class AudioEngine {
  private audio: HTMLAudioElement;
  private unsub:   (() => void) | null = null;

  // Snapshot values to avoid redundant DOM calls
  private lastTrackId:    string | null = null;
  private lastIsPlaying:  boolean       = false;
  private lastVolume:     number        = 0.8;
  private lastIsMuted:    boolean       = false;
  private lastRepeat:     string        = 'none';
  private lastAppliedSeek: number       = -1;
  private isSeeking:      boolean       = false;

  // constructor() {
  //   if (typeof window === 'undefined') return;
  //   this.audio        = new Audio();
  //   this.audio.preload = 'metadata';
  //   this.bindEvents();
  //   this.subscribeToStore();

  //   // Apply persisted volume on boot
  //   const s        = usePlayerStore.getState();
  //   this.audio.volume = s.isMuted ? 0 : s.volume;
  //   this.audio.muted  = s.isMuted;
  //   this.lastVolume   = s.volume;
  //   this.lastIsMuted  = s.isMuted;
  // }

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

  // ── DOM events → store ────────────────────────────────────────────────────

  private bindEvents() {
    const store = () => usePlayerStore.getState();

    this.audio.addEventListener('timeupdate', () => {
      if (!this.isSeeking) store().setProgress(this.audio.currentTime);
    });
    this.audio.addEventListener('durationchange', () => {
      const d = this.audio.duration;
      if (d && isFinite(d)) store().setDuration(d);
    });
    this.audio.addEventListener('waiting',  () => store().setIsLoading(true));
    this.audio.addEventListener('canplay',  () => store().setIsLoading(false));
    this.audio.addEventListener('playing',  () => store().setIsLoading(false));
    this.audio.addEventListener('seeked',   () => { this.isSeeking = false; });
    this.audio.addEventListener('ended',    () => store().playNext());
    this.audio.addEventListener('error',    () => store().setIsLoading(false));
  }

  // ── Store → DOM ───────────────────────────────────────────────────────────

  private subscribeToStore() {
    this.unsub = usePlayerStore.subscribe((state) => {
      // ── Track changed ────────────────────────────────────────────────────
      const trackId = state.currentTrack?.id ?? null;
      if (trackId !== this.lastTrackId) {
        this.lastTrackId     = trackId;
        this.lastAppliedSeek = -1;
        this.isSeeking       = false;

        if (state.currentTrack?.audioUrl) {
          this.audio.src = state.currentTrack.audioUrl;
          this.audio.load();
          if (state.isPlaying) this.safePlay();
        } else {
          this.audio.removeAttribute('src');
          this.audio.load();
        }
        return; // skip remaining checks on same tick
      }

      // ── Play / pause ─────────────────────────────────────────────────────
      if (state.isPlaying !== this.lastIsPlaying) {
        this.lastIsPlaying = state.isPlaying;
        if (state.isPlaying) this.safePlay();
        else this.audio.pause();
      }

      // ── Volume / mute ────────────────────────────────────────────────────
      if (state.volume !== this.lastVolume || state.isMuted !== this.lastIsMuted) {
        this.lastVolume  = state.volume;
        this.lastIsMuted = state.isMuted;
        this.audio.volume = state.isMuted ? 0 : Math.max(0, Math.min(1, state.volume));
        this.audio.muted  = state.isMuted;
      }

      // ── Seek (intent vs passive timeupdate) ──────────────────────────────
      if (
        !this.isSeeking &&
        isFinite(state.progressSec) &&
        Math.abs(state.progressSec - this.audio.currentTime) > 1.5 &&
        state.progressSec !== this.lastAppliedSeek
      ) {
        this.lastAppliedSeek = state.progressSec;
        this.isSeeking       = true;
        this.audio.currentTime = state.progressSec;
      }

      // ── Repeat one → loop ────────────────────────────────────────────────
      if (state.repeatMode !== this.lastRepeat) {
        this.lastRepeat  = state.repeatMode;
        this.audio.loop  = state.repeatMode === 'one';
      }
    });
  }

  private async safePlay() {
    try {
      await this.audio.play();
    } catch (err) {
      const name = (err as DOMException)?.name;
      if (name === 'NotAllowedError') usePlayerStore.getState().pause();
      // AbortError is expected when src changes mid-play — ignore
    }
  }

  destroy() {
    this.unsub?.();
    this.audio.pause();
    this.audio.src = '';
  }
}

let engine: AudioEngine | null = null;

export function initAudioEngine(): AudioEngine {
  if (typeof window === 'undefined') throw new Error('Browser only');
  if (!engine) engine = new AudioEngine();
  return engine;
}

export function getAudioEngine() { return engine; }
