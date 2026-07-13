import { Suspense } from 'react';
import type { Metadata } from 'next';
import { LogoutScreen } from '@/components/auth/logout-screen';

export const metadata: Metadata = { title: 'Signing out…' };

/**
 * /logout               → revoke current device session  (POST /auth/logout)
 * /logout?all=true      → revoke ALL sessions            (POST /auth/logout-all)
 *
 * Suspense is required because LogoutScreen calls useSearchParams(),
 * which Next.js App Router requires to be wrapped in a Suspense boundary
 * when used inside a page component that might be statically rendered.
 */
export default function LogoutPage() {
  return (
    <Suspense>
      <LogoutScreen />
    </Suspense>
  );
}