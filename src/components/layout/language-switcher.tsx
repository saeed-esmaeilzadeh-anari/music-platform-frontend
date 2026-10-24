'use client';

import { Languages } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useLocale } from '@/providers/locale-provider';
import type { Locale } from '@/lib/i18n/messages';

export function LanguageSwitcher({ compact = false }: { compact?: boolean }) {
  const { locale, setLocale } = useLocale();
  const router = useRouter();
  const nextLocale: Locale = locale === 'fa' ? 'en' : 'fa';
  const label = locale === 'fa' ? 'English' : 'فارسی';

  return (
    <button
      type="button"
      onClick={() => { setLocale(nextLocale); router.refresh(); }}
      aria-label={locale === 'fa' ? 'Switch language to English' : 'تغییر زبان به فارسی'}
      title={locale === 'fa' ? 'Switch language to English' : 'تغییر زبان به فارسی'}
      className="inline-flex h-9 items-center justify-center gap-2 rounded-full border border-border px-3 text-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
    >
      <Languages className="h-4 w-4" aria-hidden />
      {!compact && <span>{label}</span>}
    </button>
  );
}
