import { i18nConfig, isLocale, type Locale } from './config';
import type { MessageKey } from './messages';
import { translate, translateEnum, translateMessage, type TranslationValues } from './translate';

/**
 * For NON-React code that runs in the browser at event time (stores, axios interceptors, audio engine).
 * Components must use `useLocale().t` so they re-render when the language changes.
 */
export function getActiveLocale(): Locale {
  if (typeof document !== 'undefined') {
    const lang = document.documentElement.lang;
    if (isLocale(lang)) return lang;
  }
  return i18nConfig.defaultLocale;
}

export function tr(key: MessageKey, values?: TranslationValues): string {
  return translate(getActiveLocale(), key, values);
}

export function trMessage(text: string | undefined | null): string {
  return translateMessage(getActiveLocale(), text);
}

export function trEnum(group: string, value: string | null | undefined): string {
  return translateEnum(getActiveLocale(), group, value);
}
