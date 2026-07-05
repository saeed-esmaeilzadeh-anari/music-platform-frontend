import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: {
    default: 'Sign in',
    template: '%s · Soundwave',
  },
};

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  // Auth pages own their entire viewport — no sidebar, no player, no nav.
  // The split-screen layout (left panel + right form) lives in each page
  // so login and register can independently control their left-panel copy.
  return <>{children}</>;
}
