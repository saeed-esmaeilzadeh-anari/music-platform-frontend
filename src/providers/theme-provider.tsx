'use client';

import { useEffect } from 'react';
import { usePreferencesStore } from '@/stores/preferences.store';
import { useServerPreferencesSync } from '@/hooks/use-preferences';

/**
 * ThemeProvider
 *
 * Mount ONCE inside RootProviders.
 *
 * Responsibilities:
 *  1. Apply theme/accent/reduced-motion from the preferences store to <html>
 *     (class .dark toggles the dark palette, [data-accent] switches accents,
 *     [data-motion="reduced"] mirrors the reduced-motion accessibility pref).
 *  2. Hydrate the store from the server after login and push local changes
 *     back (see useServerPreferencesSync).
 *
 * First-paint correctness (no FOUC) is handled by an inline script in
 * app/layout.tsx that reads the same persisted store BEFORE React hydrates;
 * this provider keeps <html> in sync from then on, including 'system' mode.
 */
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  useServerPreferencesSync();

  useEffect(() => {
    const root = document.documentElement;
    const media = window.matchMedia('(prefers-color-scheme: dark)');

    const systemDark = () =>
      usePreferencesStore.getState().theme === 'system' && media.matches;

    const apply = () => {
      const { theme, accent, reducedMotion } = usePreferencesStore.getState();

      const dark = theme === 'dark' || systemDark();
      root.classList.toggle('dark', dark);
      if (accent) root.setAttribute('data-accent', accent);
      if (reducedMotion) root.setAttribute('data-motion', 'reduced');
      else root.removeAttribute('data-motion');
    };

    apply();

    const unsub = usePreferencesStore.subscribe(apply);
    const onSystemChange = () => {
      if (usePreferencesStore.getState().theme === 'system') apply();
    };
    media.addEventListener('change', onSystemChange);

    return () => {
      unsub();
      media.removeEventListener('change', onSystemChange);
    };
  }, []);

  return <>{children}</>;
}
