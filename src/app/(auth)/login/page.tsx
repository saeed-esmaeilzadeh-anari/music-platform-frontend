import type { Metadata } from 'next';
import { AuthWavePanel } from '@/components/auth/auth-wave-panel';
import { AuthFormShell } from '@/components/auth/auth-form-shell';
import { LoginForm } from '@/components/auth/login-form';
import { RedirectIfAuthenticated } from '@/components/auth/redirect-if-authenticated';
import { ROUTES } from '@/lib/constants';
import { cookies } from 'next/headers';
import { messages, type Locale } from '@/lib/i18n/messages';

export async function generateMetadata(): Promise<Metadata> {
  const cookieStore = await cookies();
  const isEnglish = cookieStore.get('NEXT_LOCALE')?.value === 'en';
  return { title: isEnglish ? 'Sign in' : 'ورود', description: isEnglish ? 'Sign in to your Soundwave account.' : 'برای ورود به حساب ساندوِیو وارد شوید.' };
}

export default async function LoginPage() {
  const cookieStore = await cookies();
  const locale: Locale = cookieStore.get('NEXT_LOCALE')?.value === 'en' ? 'en' : 'fa';
  const copy = messages[locale].auth;
  return (
    <main className="flex min-h-svh bg-background">
      <RedirectIfAuthenticated />

      {/* ── Left: atmospheric panel with waveform ── */}
      <AuthWavePanel
        heading={copy.musicLivesHere}
        subheading={copy.musicSubtitle}
        features={locale === 'fa' ? ['صدای باکیفیت و بدون افت', 'گوش دادن آفلاین در همه دستگاه‌ها', 'ابزار هنرمندان و آمار لحظه‌ای', 'پیشنهادهای شخصی‌سازی‌شده'] : ['Lossless audio, no compromises', 'Offline listening on every device', 'Artist tools and real-time stats', 'Personalised recommendations']}
      />

      {/* ── Right: form panel ── */}
      <AuthFormShell
        title={copy.welcomeBack}
        description={copy.credentials}
        footerPrompt={copy.noAccount}
        footerLinkLabel={copy.createOne}
        footerLinkHref={ROUTES.REGISTER}
      >
        <LoginForm />
      </AuthFormShell>
    </main>
  );
}
