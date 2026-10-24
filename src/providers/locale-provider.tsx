'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { messages, type Locale } from '@/lib/i18n/messages';

type Dictionary = typeof messages.en;
interface LocaleContextValue {
  locale: Locale;
  dir: 'rtl' | 'ltr';
  setLocale: (locale: Locale) => void;
  t: (key: string) => string;
}
const LocaleContext = createContext<LocaleContextValue | null>(null);

function getMessage(locale: Locale, key: string): string {
  return key.split('.').reduce<unknown>((value, part) => {
    if (value && typeof value === 'object' && part in value) {
      return (value as Record<string, unknown>)[part];
    }
    return undefined;
  }, messages[locale]) as string || key;
}

export function LocaleProvider({ children, initialLocale = 'fa' }: { children: React.ReactNode; initialLocale?: Locale }) {
  const [locale, setLocaleState] = useState<Locale>(initialLocale);
  const dir = locale === 'fa' ? 'rtl' : 'ltr';

  useEffect(() => {
    document.documentElement.lang = locale;
    document.documentElement.dir = dir;
    document.documentElement.dataset.locale = locale;
  }, [locale, dir]);

  const setLocale = useCallback((nextLocale: Locale) => {
    setLocaleState(nextLocale);
    document.cookie = `NEXT_LOCALE=${nextLocale}; Path=/; Max-Age=31536000; SameSite=Lax`;
  }, []);

  const t = useCallback((key: string) => getMessage(locale, key), [locale]);
  const value = useMemo(() => ({ locale, dir, setLocale, t }), [locale, dir, setLocale, t]);

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useLocale() {
  const context = useContext(LocaleContext);
  if (!context) throw new Error('useLocale must be used inside LocaleProvider');
  return context;
}
