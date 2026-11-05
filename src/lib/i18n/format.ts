import { localeMeta, type Locale } from './config';

/**
 * Locale-aware formatting. Persian → Persian digits, Jalali calendar, "٬" separators;
 * English → Gregorian, Latin digits. Backend data is never modified — only its presentation.
 */
const tag = (locale: Locale) => localeMeta[locale].intl;

function toNumber(value: number | string | null | undefined): number {
  const n = typeof value === 'string' ? Number(value) : (value ?? 0);
  return Number.isFinite(n) ? n : 0;
}

export function formatNumber(value: number | string | null | undefined, locale: Locale, options?: Intl.NumberFormatOptions): string {
  return new Intl.NumberFormat(tag(locale), options).format(toNumber(value));
}

/** 12500 → "12.5K" / "۱۲٫۵ هزار" */
export function formatCompactNumber(value: number | string | null | undefined, locale: Locale): string {
  return new Intl.NumberFormat(tag(locale), { notation: 'compact', maximumFractionDigits: 1 }).format(toNumber(value));
}

/** Takes a 0–100 value: 12.5 → "12.5%" / "۱۲٫۵٪" */
export function formatPercent(percent: number | string | null | undefined, locale: Locale): string {
  return new Intl.NumberFormat(tag(locale), { style: 'percent', maximumFractionDigits: 1 }).format(toNumber(percent) / 100);
}

/** Amount in major units (9.99). */
export function formatCurrency(amount: number, locale: Locale, currency = 'USD'): string {
  return new Intl.NumberFormat(tag(locale), { style: 'currency', currency: currency.toUpperCase() }).format(amount);
}

/** Amount in minor units, as returned by Stripe-style APIs (999 → $9.99). */
export function formatCents(cents: number, locale: Locale, currency = 'USD'): string {
  return formatCurrency(cents / 100, locale, currency);
}

const dateDefaults = (locale: Locale): Intl.DateTimeFormatOptions =>
  locale === 'fa'
    ? { calendar: 'persian', year: 'numeric', month: 'long', day: 'numeric' }
    : { year: 'numeric', month: 'short', day: 'numeric' };

/** Persian → Jalali ("۱ فروردین ۱۴۰۳"), English → Gregorian ("Mar 21, 2024"). */
export function formatDate(value: string | number | Date, locale: Locale, options?: Intl.DateTimeFormatOptions): string {
  return new Intl.DateTimeFormat(tag(locale), { ...dateDefaults(locale), ...options }).format(new Date(value));
}

/** Compact numeric date, good for table cells: "۱۴۰۳/۰۱/۰۱" / "03/21/2024". */
export function formatDateShort(value: string | number | Date, locale: Locale): string {
  return formatDate(value, locale, { month: '2-digit', day: '2-digit' });
}

export function formatDateTime(value: string | number | Date, locale: Locale): string {
  return formatDate(value, locale, { hour: '2-digit', minute: '2-digit' });
}

/** "now", "5 minutes ago", "۲ روز پیش"… falls back to a plain date after a week. */
export function formatRelativeTime(value: string | number | Date, locale: Locale): string {
  const date = new Date(value);
  const rtf = new Intl.RelativeTimeFormat(tag(locale), { numeric: 'auto', style: 'short' });
  const minutes = Math.floor((Date.now() - date.getTime()) / 60_000);
  if (minutes < 1) return rtf.format(0, 'second');
  if (minutes < 60) return rtf.format(-minutes, 'minute');
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return rtf.format(-hours, 'hour');
  const days = Math.floor(hours / 24);
  if (days < 7) return rtf.format(-days, 'day');
  return formatDate(date, locale);
}

/** Track length: 225 → "3:45" / "۳:۴۵"; 3725 → "1:02:05". */
export function formatDuration(totalSeconds: number | null | undefined, locale: Locale): string {
  const safe = Math.max(0, Math.floor(toNumber(totalSeconds)));
  const plain = new Intl.NumberFormat(tag(locale), { useGrouping: false });
  const two = new Intl.NumberFormat(tag(locale), { useGrouping: false, minimumIntegerDigits: 2 });
  const hours = Math.floor(safe / 3600);
  const minutes = Math.floor((safe % 3600) / 60);
  const seconds = safe % 60;
  return hours > 0
    ? `${plain.format(hours)}:${two.format(minutes)}:${two.format(seconds)}`
    : `${plain.format(minutes)}:${two.format(seconds)}`;
}
/** @deprecated kept for existing imports — use `formatDuration`. */
export const formatLocalizedDuration = formatDuration;

/** File size: 5242880 → "5 MB" / "۵ مگابایت". */
export function formatBytes(bytes: number | null | undefined, locale: Locale): string {
  const value = Math.max(0, toNumber(bytes));
  const units = ['byte', 'kilobyte', 'megabyte', 'gigabyte'] as const;
  let index = 0;
  let size = value;
  while (size >= 1024 && index < units.length - 1) {
    size /= 1024;
    index += 1;
  }
  return new Intl.NumberFormat(tag(locale), { style: 'unit', unit: units[index], unitDisplay: 'short', maximumFractionDigits: 1 }).format(size);
}

/** Converts ASCII digits inside an already-built string to the language's digits (Persian only). */
export function localizeDigits(input: string | number, locale: Locale): string {
  const text = String(input);
  return locale === 'fa' ? text.replace(/[0-9]/g, d => '۰۱۲۳۴۵۶۷۸۹'[Number(d)]) : text;
}

/** All formatters bound to one language — exposed as `useLocale().format`. */
export function createFormatter(locale: Locale) {
  return {
    number: (v: number | string | null | undefined, options?: Intl.NumberFormatOptions) => formatNumber(v, locale, options),
    compact: (v: number | string | null | undefined) => formatCompactNumber(v, locale),
    percent: (v: number | string | null | undefined) => formatPercent(v, locale),
    currency: (amount: number, currency?: string) => formatCurrency(amount, locale, currency),
    cents: (cents: number, currency?: string) => formatCents(cents, locale, currency),
    date: (v: string | number | Date, options?: Intl.DateTimeFormatOptions) => formatDate(v, locale, options),
    dateShort: (v: string | number | Date) => formatDateShort(v, locale),
    dateTime: (v: string | number | Date) => formatDateTime(v, locale),
    relative: (v: string | number | Date) => formatRelativeTime(v, locale),
    duration: (seconds: number | null | undefined) => formatDuration(seconds, locale),
    bytes: (bytes: number | null | undefined) => formatBytes(bytes, locale),
    digits: (v: string | number) => localizeDigits(v, locale),
  };
}
export type Formatter = ReturnType<typeof createFormatter>;
