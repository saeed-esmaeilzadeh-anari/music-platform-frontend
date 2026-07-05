import type { Metadata } from 'next';
import { AuthWavePanel } from '@/components/auth/auth-wave-panel';
import { AuthFormShell } from '@/components/auth/auth-form-shell';
import { LoginForm } from '@/components/auth/login-form';
import { ROUTES } from '@/lib/constants';

export const metadata: Metadata = {
  title: 'Sign in',
  description: 'Sign in to your Soundwave account.',
};

export default function LoginPage() {
  return (
    <main className="flex min-h-svh bg-background">
      {/* ── Left: atmospheric panel with waveform ── */}
      <AuthWavePanel
        heading="Music lives here."
        subheading="Stream millions of tracks, follow your favourite artists, and build playlists that move with you."
        features={[
          'Lossless audio, no compromises',
          'Offline listening on every device',
          'Artist tools and real-time stats',
          'Personalised recommendations',
        ]}
      />

      {/* ── Right: form panel ── */}
      <AuthFormShell
        title="Welcome back"
        description="Enter your credentials to continue."
        footerPrompt="Don't have an account?"
        footerLinkLabel="Create one"
        footerLinkHref={ROUTES.REGISTER}
      >
        <LoginForm />
      </AuthFormShell>
    </main>
  );
}
