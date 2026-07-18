'use client';

import { QueryProvider } from './query-provider';
import { AuthProvider } from './auth-provider';
import { ToastProvider } from './toast-provider';
import { AudioProvider } from './audio-provider';

interface RootProvidersProps {
  children: React.ReactNode;
}

/**
 * Provider order:
 *  QueryProvider   — outermost so all children can useQuery
 *  ToastProvider   — needs no deps
 *  AudioProvider   — boots AudioEngine + keyboard shortcuts (client-only, no deps)
 *  AuthProvider    — uses useQuery internally
 */
export function RootProviders({ children }: RootProvidersProps) {
  return (
    <QueryProvider>
      <ToastProvider>
        <AudioProvider>
          <AuthProvider>{children}</AuthProvider>
        </AudioProvider>
      </ToastProvider>
    </QueryProvider>
  );
}

export { QueryProvider } from './query-provider';
export { AuthProvider } from './auth-provider';
export { ToastProvider, useToast } from './toast-provider';
export { AudioProvider } from './audio-provider';
