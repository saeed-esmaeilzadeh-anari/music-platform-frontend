import { localeMeta, type Locale } from './config';
import { messages, type MessageKey, type PluralForms } from './messages';

/** Numbers are formatted for the active language automatically (۱٬۲۳۴ / 1,234); pass strings for preformatted values. */
export type TranslationValues = Record<string, string | number>;

function lookup(tree: unknown, key: string): string | PluralForms | undefined {
  let node: unknown = tree;
  for (const part of key.split('.')) {
    if (node && typeof node === 'object' && part in node) node = (node as Record<string, unknown>)[part];
    else return undefined;
  }
  return typeof node === 'string' || (node && typeof node === 'object') ? (node as string | PluralForms) : undefined;
}

export function interpolate(template: string, values: TranslationValues | undefined, locale: Locale): string {
  if (!values) return template;
  return template.replace(/\{(\w+)\}/g, (match, name: string) => {
    const value = values[name];
    if (value === undefined) return match;
    return typeof value === 'number' ? new Intl.NumberFormat(localeMeta[locale].intl).format(value) : value;
  });
}

const reported = new Set<string>();

/** The raw template (plural form already chosen, placeholders untouched). */
export function resolveTemplate(locale: Locale, key: MessageKey, count?: number): string {
  const entry = lookup(messages[locale], key) ?? lookup(messages.en, key);
  if (entry === undefined) {
    if (!reported.has(key)) {
      reported.add(key);
      console.error(`[i18n] Missing translation key "${key}"`);
    }
    return process.env.NODE_ENV === 'production' ? '' : `⚠ ${key}`;
  }
  if (typeof entry === 'string') return entry;
  const category = new Intl.PluralRules(localeMeta[locale].intl).select(Number(count ?? 0));
  return entry[category] ?? entry.other;
}

/** Pure translation (no React). Falls back to English, then to an empty string — never to the raw key in production. */
export function translate(locale: Locale, key: MessageKey, values?: TranslationValues): string {
  const count = values && typeof values.count === 'number' ? values.count : Number(values?.count ?? 0);
  return interpolate(resolveTemplate(locale, key, count), values, locale);
}

/**
 * For text that is *either* a translation key (zod messages, constants) *or* already human text (server messages).
 * Keys are translated; anything else is returned untouched.
 */
export function translateMessage(locale: Locale, text: string | undefined | null): string {
  if (!text) return '';
  return typeof lookup(messages.en, text) === 'string' ? translate(locale, text as MessageKey) : text;
}

/** Label for a backend enum value (role, status, plan…); shows the raw value instead of a key if it is unknown. */
export function translateEnum(locale: Locale, group: string, value: string | null | undefined): string {
  if (!value) return '';
  const key = `enums.${group}.${value}`;
  const entry = lookup(messages[locale], key) ?? lookup(messages.en, key);
  return typeof entry === 'string' ? entry : value;
}
