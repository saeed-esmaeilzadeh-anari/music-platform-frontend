import type { Metadata } from 'next';
import { AuthWavePanel } from '@/components/auth/auth-wave-panel';
import { AuthFormShell } from '@/components/auth/auth-form-shell';
import { ForgotPasswordForm } from '@/components/auth/forgot-password-form';
import { ROUTES } from '@/lib/constants';
import { cookies } from 'next/headers';
import { messages, type Locale } from '@/lib/i18n/messages';

export async function generateMetadata(): Promise<Metadata> {
  const cookieStore = await cookies();
  const isEnglish = cookieStore.get('NEXT_LOCALE')?.value === 'en';
  return { title: isEnglish ? 'Reset password' : 'بازیابی رمز عبور', description: isEnglish ? 'Request a password reset link for your Soundwave account.' : 'درخواست پیوند بازیابی رمز عبور حساب ساندوِیو.' };
}

export default async function ForgotPasswordPage() {
  const cookieStore = await cookies();
  const locale: Locale = cookieStore.get('NEXT_LOCALE')?.value === 'en' ? 'en' : 'fa';
  const copy = messages[locale].auth;
  return (
    <main className="flex min-h-svh bg-background">
      {/* Left panel — calmer copy for a recovery flow */}
      <AuthWavePanel
        heading={copy.resetHeading}
        subheading={copy.resetSubtitle}
        features={[
          'Reset link expires in 15 minutes',
          'Only the latest link is valid',
          'Contact support if you keep having trouble',
        ]}
      />

      {/* Right panel — no footer link needed, form has its own back link */}
      <AuthFormShell
        title={copy.resetTitle}
        description={copy.resetDescription}
        footerPrompt={copy.remembered}
        footerLinkLabel={copy.signInTitle}
        footerLinkHref={ROUTES.LOGIN}
      >
        <ForgotPasswordForm />
      </AuthFormShell>
    </main>
  );
}

