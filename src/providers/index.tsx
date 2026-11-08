'use client';

import { QueryProvider } from './query-provider';
import { AuthProvider } from './auth-provider';
import { ToastProvider } from './toast-provider';
import { AudioProvider } from './audio-provider';
import { ThemeProvider } from './theme-provider';

interface RootProvidersProps {
  children: React.ReactNode;
}

/**
 * Provider order:
 *  QueryProvider   — outermost so all children can useQuery
 *  ToastProvider   — needs no deps
 *  ThemeProvider   — applies prefs to <html>, syncs server prefs (needs toast)
 *  AudioProvider   — boots AudioEngine + keyboard shortcuts (client-only, no deps)
 *  AuthProvider    — uses useQuery internally
 */
export function RootProviders({ children }: RootProvidersProps) {
  return (
    <QueryProvider>
      <ToastProvider>
        <ThemeProvider>
          <AudioProvider>
            <AuthProvider>{children}</AuthProvider>
          </AudioProvider>
        </ThemeProvider>
      </ToastProvider>
    </QueryProvider>
  );
}

export { QueryProvider } from './query-provider';
export { AuthProvider } from './auth-provider';
export { ToastProvider, useToast } from './toast-provider';
export { AudioProvider } from './audio-provider';
export { ThemeProvider } from './theme-provider';
