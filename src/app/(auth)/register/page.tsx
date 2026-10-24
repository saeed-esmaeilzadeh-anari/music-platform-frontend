import type { Metadata } from 'next';
import { AuthWavePanel } from '@/components/auth/auth-wave-panel';
import { AuthFormShell } from '@/components/auth/auth-form-shell';
import { RegisterForm } from '@/components/auth/register-form';
import { RedirectIfAuthenticated } from '@/components/auth/redirect-if-authenticated';
import { ROUTES } from '@/lib/constants';
import { cookies } from 'next/headers';
import { messages, type Locale } from '@/lib/i18n/messages';

export async function generateMetadata(): Promise<Metadata> {
  const cookieStore = await cookies();
  const isEnglish = cookieStore.get('NEXT_LOCALE')?.value === 'en';
  return { title: isEnglish ? 'Create account' : 'ایجاد حساب', description: isEnglish ? 'Create your Soundwave account and start listening.' : 'حساب ساندوِیو خود را بسازید و موسیقی گوش کنید.' };
}

export default async function RegisterPage() {
  const cookieStore = await cookies();
  const locale: Locale = cookieStore.get('NEXT_LOCALE')?.value === 'en' ? 'en' : 'fa';
  const copy = messages[locale].auth;
  return (
    <main className="flex min-h-svh bg-background">
      <RedirectIfAuthenticated />

      {/* Left panel — distinct copy from login */}
      <AuthWavePanel
        heading={copy.joinHeading}
        subheading={copy.joinSubtitle}
        features={locale === 'fa' ? ['طرح رایگان بدون نیاز به کارت بانکی', 'انتشار آهنگ‌های خود به‌عنوان هنرمند', 'کشف موسیقی متناسب با سلیقه شما', 'همگام‌سازی دستگاه‌ها و گوش دادن آفلاین'] : ['Free tier available — no card required', 'Publish your own tracks as an artist', 'Discover music tailored to your taste', 'Cross-device sync and offline listening']}
      />

      {/* Right form panel */}
      <AuthFormShell
        title={copy.registerTitle}
        description={copy.registerDescription}
        footerPrompt={copy.alreadyAccount}
        footerLinkLabel={copy.signInTitle}
        footerLinkHref={ROUTES.LOGIN}
      >
        <RegisterForm />
      </AuthFormShell>
    </main>
  );
}