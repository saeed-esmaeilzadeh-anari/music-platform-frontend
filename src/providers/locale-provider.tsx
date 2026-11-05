'use client';

import { Fragment, createContext, useCallback, useContext, useEffect, useMemo, useState, useTransition, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { Direction } from 'radix-ui';
import { i18nConfig, localeMeta, type Locale } from '@/lib/i18n/config';
import { createFormatter, type Formatter } from '@/lib/i18n/format';
import type { MessageKey } from '@/lib/i18n/messages';
import { resolveTemplate, translate, translateEnum, translateMessage, type TranslationValues } from '@/lib/i18n/translate';

export type TFunction = (key: MessageKey, values?: TranslationValues) => string;
/** Like TFunction, but placeholders may be React nodes (links, <strong>…) — keeps whole sentences translatable. */
export type RichFunction = (key: MessageKey, values: Record<string, ReactNode>) => ReactNode;

interface LocaleContextValue {
  locale: Locale;
  dir: 'rtl' | 'ltr';
  isRtl: boolean;
  /** True while the server is re-rendering after a language change. */
  isPending: boolean;
  setLocale: (locale: Locale) => void;
  t: TFunction;
  rich: RichFunction;
  /** Translates text that may be a message key (e.g. zod messages) and leaves normal text untouched. */
  tm: (text: string | undefined | null) => string;
  /** Label for a backend enum value; unknown values are shown as-is, never as a key. */
  tEnum: (group: string, value: string | null | undefined) => string;
  format: Formatter;
}

const LocaleContext = createContext<LocaleContextValue | null>(null);

export function LocaleProvider({ children, initialLocale }: { children: React.ReactNode; initialLocale: Locale }) {
  const router = useRouter();
  const [locale, setLocaleState] = useState<Locale>(initialLocale);
  const [isPending, startTransition] = useTransition();
  const { dir } = localeMeta[locale];

  // Instant feedback; the server also renders <html lang dir> from the cookie, so first paint is already correct.
  useEffect(() => {
    const root = document.documentElement;
    root.lang = locale;
    root.dir = dir;
    root.dataset.locale = locale;
  }, [locale, dir]);

  const setLocale = useCallback(
    (next: Locale) => {
      if (next === locale) return;
      const secure = window.location.protocol === 'https:' ? '; Secure' : '';
      document.cookie = `${i18nConfig.cookieName}=${next}; Path=/; Max-Age=${i18nConfig.cookieMaxAge}; SameSite=Lax${secure}`;
      setLocaleState(next);
      // Re-renders Server Components (metadata, server copy). Client state — auth, player, forms — is preserved.
      startTransition(() => router.refresh());
    },
    [locale, router],
  );

  const value = useMemo<LocaleContextValue>(() => {
    const intl = localeMeta[locale].intl;
    return {
      locale,
      dir,
      isRtl: dir === 'rtl',
      isPending,
      setLocale,
      t: (key, values) => translate(locale, key, values),
      rich: (key, values) => {
        const count = typeof values.count === 'number' ? values.count : undefined;
        return resolveTemplate(locale, key, count)
          .split(/(\{\w+\})/g)
          .map((part, index) => {
            const name = /^\{(\w+)\}$/.exec(part)?.[1];
            if (!name || !(name in values)) return part;
            const v = values[name];
            return <Fragment key={index}>{typeof v === 'number' ? new Intl.NumberFormat(intl).format(v) : v}</Fragment>;
          });
      },
      tm: text => translateMessage(locale, text),
      tEnum: (group, v) => translateEnum(locale, group, v),
      format: createFormatter(locale),
    };
  }, [locale, dir, isPending, setLocale]);

  return (
    <LocaleContext.Provider value={value}>
      {/* Radix primitives (dialogs, menus, selects…) need this to place and navigate correctly in RTL. */}
      <Direction.Provider dir={dir}>{children}</Direction.Provider>
    </LocaleContext.Provider>
  );
}

export function useLocale() {
  const context = useContext(LocaleContext);
  if (!context) throw new Error('useLocale must be used inside LocaleProvider');
  return context;
}
