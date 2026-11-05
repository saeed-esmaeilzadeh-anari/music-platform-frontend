import { cookies, headers } from 'next/headers';
import { i18nConfig, isLocale, negotiateLocale, type Locale } from './config';
import type { MessageKey } from './messages';
import { translate, translateEnum, type TranslationValues } from './translate';

/** saved cookie → Accept-Language (first visit, if enabled) → default. */
export async function getServerLocale(): Promise<Locale> {
  const saved = (await cookies()).get(i18nConfig.cookieName)?.value;
  if (isLocale(saved)) return saved;
  if (i18nConfig.detectFromBrowser) return negotiateLocale((await headers()).get('accept-language'));
  return i18nConfig.defaultLocale;
}

/** Translator for Server Components, generateMetadata and route handlers. */
export async function getServerT() {
  const locale = await getServerLocale();
  return {
    locale,
    t: (key: MessageKey, values?: TranslationValues) => translate(locale, key, values),
    tEnum: (group: string, value: string | null | undefined) => translateEnum(locale, group, value),
  };
}
