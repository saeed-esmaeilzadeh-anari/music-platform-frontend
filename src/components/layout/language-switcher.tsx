'use client';

import { Languages } from 'lucide-react';
import { localeMeta, type Locale } from '@/lib/i18n/config';
import { useLocale } from '@/providers/locale-provider';
import { cn } from '@/lib/utils';

export function LanguageSwitcher({ compact = false, className }: { compact?: boolean; className?: string }) {
  const { locale, setLocale, isPending, t } = useLocale();
  const nextLocale: Locale = locale === 'fa' ? 'en' : 'fa';
  const label = locale === 'fa' ? t('language.switchToEnglish') : t('language.switchToPersian');

  return (
    <button
      type="button"
      onClick={() => setLocale(nextLocale)}
      disabled={isPending}
      aria-label={label}
      title={label}
      className={cn(
        'inline-flex h-9 items-center justify-center gap-2 rounded-full border border-border px-3 text-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground disabled:opacity-60',
        className,
      )}
    >
      <Languages className="h-4 w-4" aria-hidden />
      {/* Always the target language's own name, tagged with its own lang so it shapes/aligns correctly. */}
      {!compact && <span lang={nextLocale}>{localeMeta[nextLocale].nativeName}</span>}
    </button>
  );
}
