'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getAccessToken, getRefreshToken } from '@/lib/api/http-client';
import { ROUTES } from '@/lib/constants';

/**
 * Drop into /login and /register: if this browser already holds a session,
 * skip the form and go straight into the app (same landing page as a fresh login).
 * Renders nothing, so the form paints immediately for the normal guest case.
 *
 * Deliberately keyed off the stored TOKENS, not the persisted zustand
 * `isAuthenticated` flag: the 401 interceptor clears the tokens but not that flag,
 * so trusting the flag could bounce /login -> /browse -> /login forever.
 */
export function RedirectIfAuthenticated() {
  const router = useRouter();

  useEffect(() => {
    if (getAccessToken() || getRefreshToken()) {
      router.replace(ROUTES.BROWSE);
    }
  }, [router]);

  return null;
}
