import type { Locale } from './messages';

const localeTag: Record<Locale, string> = { fa: 'fa-IR', en: 'en-US' };

export function formatNumber(value: number, locale: Locale, options?: Intl.NumberFormatOptions): string {
  return new Intl.NumberFormat(localeTag[locale], options).format(value);
}

export function formatDate(value: string | number | Date, locale: Locale, options?: Intl.DateTimeFormatOptions): string {
  const defaults: Intl.DateTimeFormatOptions = locale === 'fa'
    ? { calendar: 'persian', year: 'numeric', month: 'long', day: 'numeric' }
    : { year: 'numeric', month: 'short', day: 'numeric' };
  return new Intl.DateTimeFormat(localeTag[locale], { ...defaults, ...options }).format(new Date(value));
}

export function formatDateTime(value: string | number | Date, locale: Locale): string {
  return formatDate(value, locale, { hour: '2-digit', minute: '2-digit' });
}

export function formatCurrency(value: number, locale: Locale, currency = 'USD'): string {
  return new Intl.NumberFormat(localeTag[locale], { style: 'currency', currency }).format(value);
}

export function formatLocalizedDuration(totalSeconds: number, locale: Locale): string {
  const safeSeconds = Math.max(0, Math.floor(totalSeconds || 0));
  const hours = Math.floor(safeSeconds / 3600);
  const minutes = Math.floor((safeSeconds % 3600) / 60);
  const seconds = safeSeconds % 60;
  const raw = hours > 0
    ? `${hours}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
    : `${minutes}:${String(seconds).padStart(2, '0')}`;
  return locale === 'fa' ? raw.replace(/[0-9]/g, digit => '۰۱۲۳۴۵۶۷۸۹'[Number(digit)]) : raw;
}
