/**
 * Preferences Store
 *
 * Client-side preferences stored in localStorage via Zustand persist.
 * Used for settings that have no corresponding backend endpoint:
 *   - Appearance (theme, accent colour)
 *   - Playback (crossfade, autoplay, audio quality)
 *   - Notification display toggles
 *   - Privacy toggles
 *
 * All of these are clearly labeled "saved locally" in the UI.
 * They apply immediately and survive page refresh.
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// ─── Appearance ───────────────────────────────────────────────────────────────

export type ThemeMode   = 'dark' | 'light' | 'system';
export type AccentColor = 'violet' | 'blue' | 'emerald' | 'rose' | 'amber' | 'cyan';

// ─── Playback ─────────────────────────────────────────────────────────────────

export type AudioQuality = 'auto' | 'normal' | 'high' | 'lossless';

export interface PlaybackPrefs {
  audioQuality:          AudioQuality;
  crossfadeSec:          number;       // 0 = off, 1-12 s
  autoplayRelated:       boolean;
  normalizeVolume:       boolean;
  showExplicitContent:   boolean;
}

// ─── Notifications display ────────────────────────────────────────────────────

export interface NotifDisplayPrefs {
  newFollower:          boolean;
  newRelease:           boolean;
  playlistAdd:          boolean;
  commentReply:         boolean;
  likeReceived:         boolean;
  subscriptionRenewed:  boolean;
  paymentFailed:        boolean;
  systemMessages:       boolean;
}

// ─── Privacy ──────────────────────────────────────────────────────────────────

export interface PrivacyPrefs {
  showListeningActivity: boolean;
  showPlaylists:         boolean;
  showFavorites:         boolean;
  allowDataAnalytics:    boolean;
}

// ─── Full state ───────────────────────────────────────────────────────────────

interface PreferencesState {
  theme:     ThemeMode;
  accent:    AccentColor;
  playback:  PlaybackPrefs;
  notifs:    NotifDisplayPrefs;
  privacy:   PrivacyPrefs;

  setTheme:   (v: ThemeMode)    => void;
  setAccent:  (v: AccentColor)  => void;
  setPlayback: (v: Partial<PlaybackPrefs>)     => void;
  setNotifs:   (v: Partial<NotifDisplayPrefs>) => void;
  setPrivacy:  (v: Partial<PrivacyPrefs>)      => void;
  resetAll:   () => void;
}

const DEFAULT_PLAYBACK: PlaybackPrefs = {
  audioQuality:        'auto',
  crossfadeSec:        0,
  autoplayRelated:     true,
  normalizeVolume:     false,
  showExplicitContent: true,
};

const DEFAULT_NOTIFS: NotifDisplayPrefs = {
  newFollower:         true,
  newRelease:          true,
  playlistAdd:         true,
  commentReply:        true,
  likeReceived:        true,
  subscriptionRenewed: true,
  paymentFailed:       true,
  systemMessages:      true,
};

const DEFAULT_PRIVACY: PrivacyPrefs = {
  showListeningActivity: true,
  showPlaylists:         true,
  showFavorites:         true,
  allowDataAnalytics:    true,
};

export const usePreferencesStore = create<PreferencesState>()(
  persist(
    (set) => ({
      theme:   'dark',
      accent:  'violet',
      playback: DEFAULT_PLAYBACK,
      notifs:   DEFAULT_NOTIFS,
      privacy:  DEFAULT_PRIVACY,

      setTheme:   (theme)    => set({ theme }),
      setAccent:  (accent)   => set({ accent }),
      setPlayback: (v)       => set(s => ({ playback: { ...s.playback, ...v } })),
      setNotifs:   (v)       => set(s => ({ notifs:   { ...s.notifs,   ...v } })),
      setPrivacy:  (v)       => set(s => ({ privacy:  { ...s.privacy,  ...v } })),
      resetAll:   ()         => set({
        theme:   'dark',
        accent:  'violet',
        playback: DEFAULT_PLAYBACK,
        notifs:   DEFAULT_NOTIFS,
        privacy:  DEFAULT_PRIVACY,
      }),
    }),
    { name: 'ms-prefs' },
  ),
);
