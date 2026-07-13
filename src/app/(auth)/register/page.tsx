import type { Metadata } from 'next';
import { AuthWavePanel } from '@/components/auth/auth-wave-panel';
import { AuthFormShell } from '@/components/auth/auth-form-shell';
import { RegisterForm } from '@/components/auth/register-form';
import { ROUTES } from '@/lib/constants';

export const metadata: Metadata = {
  title: 'Create account',
  description: 'Create your Soundwave account and start listening.',
};

export default function RegisterPage() {
  return (
    <main className="flex min-h-svh bg-background">
      {/* Left panel — distinct copy from login */}
      <AuthWavePanel
        heading="Join the sound."
        subheading="Create your account and unlock millions of tracks, artist tools, and personalised playlists."
        features={[
          'Free tier available — no card required',
          'Publish your own tracks as an artist',
          'Discover music tailored to your taste',
          'Cross-device sync and offline listening',
        ]}
      />

      {/* Right form panel */}
      <AuthFormShell
        title="Create your account"
        description="Fill in the details below to get started."
        footerPrompt="Already have an account?"
        footerLinkLabel="Sign in"
        footerLinkHref={ROUTES.LOGIN}
      >
        <RegisterForm />
      </AuthFormShell>
    </main>
  );
}