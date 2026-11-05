/**
 * Single source of truth for supported languages and first-visit behaviour.
 * Change `defaultLocale` / `detectFromBrowser` here — nothing else needs to be touched.
 */
export const locales = ['fa', 'en'] as const;
export type Locale = (typeof locales)[number];

export const i18nConfig = {
  /** Used when there is no saved preference and the browser gives no usable hint. */
  defaultLocale: 'fa' as Locale,
  /** First visit only: pick fa/en from the Accept-Language header before using `defaultLocale`. */
  detectFromBrowser: true,
  /** The saved preference. Readable on the server, so the first paint already has the right lang/dir. */
  cookieName: 'NEXT_LOCALE',
  cookieMaxAge: 60 * 60 * 24 * 365,
} as const;

export const localeMeta: Record<Locale, { dir: 'rtl' | 'ltr'; intl: string; nativeName: string }> = {
  fa: { dir: 'rtl', intl: 'fa-IR', nativeName: 'فارسی' },
  en: { dir: 'ltr', intl: 'en-US', nativeName: 'English' },
};

export function isLocale(value: unknown): value is Locale {
  return value === 'fa' || value === 'en';
}

/** Picks the best supported language from an Accept-Language header ("fa-IR,fa;q=0.9,en;q=0.8"). */
export function negotiateLocale(acceptLanguage?: string | null): Locale {
  if (acceptLanguage) {
    const ranked = acceptLanguage
      .split(',')
      .map((part, index) => {
        const [tag, ...params] = part.trim().split(';');
        const q = Number(params.find(p => p.trim().startsWith('q='))?.split('=')[1] ?? 1);
        return { primary: tag.trim().toLowerCase().split('-')[0], q: Number.isFinite(q) ? q : 0, index };
      })
      .filter(entry => entry.primary && entry.q > 0)
      .sort((a, b) => b.q - a.q || a.index - b.index);
    for (const { primary } of ranked) {
      if (primary === 'fa' || primary === 'prs' || primary === 'pes') return 'fa';
      if (primary === 'en') return 'en';
    }
  }
  return i18nConfig.defaultLocale;
}
