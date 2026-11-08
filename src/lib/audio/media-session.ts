/**
 * Media Session API integration.
 *
 * Syncs the player store to the OS media controls (lock screen, notification
 * tray, hardware keys, Bluetooth headsets) and wires the standard action
 * handlers back into the store. Safari/Firefox/Chrome all support a subset;
 * every call is feature-detected and silently ignored when unsupported.
 */

import { usePlayerStore } from '@/stores/player.store';

function setMetadata(track: {
  title: string;
  artistName?: string;
  albumId?: string | null;
  coverUrl?: string | null;
}) {
  if (!('mediaSession' in navigator) || !('MediaMetadata' in window)) return;

  const metadata = new MediaMetadata({
    title: track.title,
    artist: track.artistName ?? '',
    album: track.albumId ? 'Soundwave' : '',
    artwork: track.coverUrl
      ? [{ src: track.coverUrl, sizes: '512x512', type: 'image/jpeg' }]
      : [],
  });
  navigator.mediaSession.metadata = metadata;
}

export function initMediaSession(): void {
  if (typeof window === 'undefined') return;
  if (!('mediaSession' in navigator)) return; // unsupported browser

  const store = () => usePlayerStore.getState();

  const actions: Record<string, (details?: unknown) => void> = {
    play: () => store().resume(),
    pause: () => store().pause(),
    previoustrack: () => store().playPrevious(),
    nexttrack: () => store().playNext(),
    seekbackward: (details) => {
      const back = (details as { seekOffset?: number } | undefined)?.seekOffset ?? 10;
      store().seekTo(Math.max(0, store().progressSec - back));
    },
    seekforward: (details) => {
      const fwd = (details as { seekOffset?: number } | undefined)?.seekOffset ?? 10;
      store().seekTo(Math.min(store().durationSec, store().progressSec + fwd));
    },
    seekto: (details) => {
      const d = details as { seekTime?: number; fastSeek?: boolean } | undefined;
      if (d && typeof d.seekTime === 'number') store().seekTo(d.seekTime);
    },
  };

  for (const [action, handler] of Object.entries(actions)) {
    try {
      navigator.mediaSession.setActionHandler(
        action as MediaSessionAction,
        handler as MediaSessionActionHandler,
      );
    } catch {
      // unsupported action on this browser — fine
    }
  }

  usePlayerStore.subscribe((state) => {
    try {
      // Track changed → update artwork/metadata
      if (state.currentTrack) {
        setMetadata({
          title: state.currentTrack.title,
          artistName: state.currentTrack.artist?.stageName,
          albumId: state.currentTrack.albumId,
          coverUrl: state.currentTrack.coverUrl,
        });
      }

      navigator.mediaSession.playbackState = state.isPlaying ? 'playing' : 'paused';

      if (state.durationSec > 0) {
        navigator.mediaSession.setPositionState?.({
          duration: state.durationSec,
          playbackRate: 1,
          position: Math.min(state.progressSec, state.durationSec),
        });
      }
    } catch {
      // never let media-session sync break playback
    }
  });
}
