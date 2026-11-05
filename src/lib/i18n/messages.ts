import en from './messages/en.json';
import fa from './messages/fa.json';
import type { Locale } from './config';

export type { Locale } from './config';
export { locales } from './config';

/** A message may carry plural forms; `t(key, { count })` picks the right one via Intl.PluralRules. */
export interface PluralForms {
  zero?: string;
  one?: string;
  two?: string;
  few?: string;
  many?: string;
  other: string;
}

type Dictionary = typeof en;

// Compile-time parity guard: a key missing from (or extra in) either language is a TypeScript error.
const faMatchesEn: Dictionary = fa;
const enMatchesFa: typeof fa = en;
void faMatchesEn;
void enMatchesFa;

export const messages: Record<Locale, Dictionary> = { en, fa };

type Paths<T, Prefix extends string = ''> = {
  [K in keyof T & string]: T[K] extends string
    ? `${Prefix}${K}`
    : T[K] extends { other: string }
      ? `${Prefix}${K}`
      : Paths<T[K], `${Prefix}${K}.`>;
}[keyof T & string];

/** Every valid translation key, e.g. "auth.signInTitle". Unknown keys fail type-checking. */
export type MessageKey = Paths<Dictionary>;

/** Identity helper that type-checks a key where no translator is available (zod messages, constants). */
export const msg = <K extends MessageKey>(key: K): K => key;
