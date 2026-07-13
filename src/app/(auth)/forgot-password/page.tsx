import type { Metadata } from 'next';
import { AuthWavePanel } from '@/components/auth/auth-wave-panel';
import { AuthFormShell } from '@/components/auth/auth-form-shell';
import { ForgotPasswordForm } from '@/components/auth/forgot-password-form';
import { ROUTES } from '@/lib/constants';

export const metadata: Metadata = {
  title: 'Reset password',
  description: 'Request a password reset link for your Soundwave account.',
};

export default function ForgotPasswordPage() {
  return (
    <main className="flex min-h-svh bg-background">
      {/* Left panel — calmer copy for a recovery flow */}
      <AuthWavePanel
        heading="Locked out?"
        subheading="No worries. Enter your email address and we'll send you a link to get back into your account."
        features={[
          'Reset link expires in 15 minutes',
          'Only the latest link is valid',
          'Contact support if you keep having trouble',
        ]}
      />

      {/* Right panel — no footer link needed, form has its own back link */}
      <AuthFormShell
        title="Reset your password"
        description="Enter your account email and we'll send you a reset link."
        footerPrompt="Remembered it?"
        footerLinkLabel="Sign in"
        footerLinkHref={ROUTES.LOGIN}
      >
        <ForgotPasswordForm />
      </AuthFormShell>
    </main>
  );
}

