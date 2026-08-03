/**
 * Persian (Farsi) formatting helpers — used exclusively by the admin
 * dashboard (`/admin/**`). Kept separate from `lib/@/lib/utils/index/index.ts` so the
 * rest of the (listener-facing) app is unaffected.
 *
 * Dates are rendered in the Jalali (Persian) calendar via the native
 * `Intl` API (`calendar: 'persian'`) — no extra dependency required and
 * no hand-rolled date-math to get wrong.
 */

const FA_LOCALE = 'fa-IR';

// ─── Numbers ──────────────────────────────────────────────────────────────────

/** 1234 → "۱٬۲۳۴" */
export function formatFaNumber(n: number | string): string {
  const num = typeof n === 'string' ? Number(n) : n;
  if (Number.isNaN(num)) return '۰';
  return new Intl.NumberFormat(FA_LOCALE).format(num);
}

/** 12500 → "۱۲.۵ هزار", 3200000 → "۳.۲ میلیون" */
export function formatFaCompact(n: number | string): string {
  const num = typeof n === 'string' ? Number(n) : n;
  if (Number.isNaN(num)) return '۰';
  return new Intl.NumberFormat(FA_LOCALE, { notation: 'compact', maximumFractionDigits: 1 }).format(
    num,
  );
}

/** Converts any ASCII-digit string ("3:45") to Persian digits ("۳:۴۵") */
export function toFaDigits(input: string | number): string {
  const map: Record<string, string> = {
    '0': '۰', '1': '۱', '2': '۲', '3': '۳', '4': '۴',
    '5': '۵', '6': '۶', '7': '۷', '8': '۸', '9': '۹',
  };
  return String(input).replace(/[0-9]/g, (d) => map[d]);
}

/** Formats a track duration in seconds → Persian "m:ss" */
export function formatFaDuration(seconds: number): string {
  if (!seconds || seconds < 0) return toFaDigits('0:00');
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  const str =
    h > 0
      ? `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
      : `${m}:${String(s).padStart(2, '0')}`;
  return toFaDigits(str);
}

/** Formats cents → Persian-formatted currency string, e.g. 999 → "۹٫۹۹ دلار" */
export function formatFaCents(cents: number, currency = 'USD'): string {
  return new Intl.NumberFormat(FA_LOCALE, { style: 'currency', currency }).format(cents / 100);
}

// ─── Dates (Jalali / Persian calendar) ────────────────────────────────────────

/** "2024-03-21T10:00:00Z" → "۱ فروردین ۱۴۰۳" */
export function formatJalaliDate(date: string | Date): string {
  return new Intl.DateTimeFormat(FA_LOCALE, {
    calendar: 'persian',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(date));
}

/** "2024-03-21T10:00:00Z" → "۱ فروردین ۱۴۰۳، ساعت ۱۳:۳۰" */
export function formatJalaliDateTime(date: string | Date): string {
  const datePart = formatJalaliDate(date);
  const timePart = new Intl.DateTimeFormat(FA_LOCALE, {
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date));
  return `${datePart}، ساعت ${timePart}`;
}

/** "2024-03-21" → "۱۴۰۳/۰۱/۰۱" (compact, good for table cells) */
export function formatJalaliShort(date: string | Date): string {
  return new Intl.DateTimeFormat(FA_LOCALE, {
    calendar: 'persian',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date(date));
}

/** Relative time in Farsi: "لحظاتی پیش", "۵ دقیقه پیش", "۲ روز پیش"... */
export function formatFaRelativeTime(date: string | Date): string {
  const d = new Date(date);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const mins = Math.floor(diffMs / 60_000);

  if (mins < 1) return 'لحظاتی پیش';
  if (mins < 60) return `${toFaDigits(mins)} دقیقه پیش`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${toFaDigits(hrs)} ساعت پیش`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${toFaDigits(days)} روز پیش`;
  const weeks = Math.floor(days / 7);
  if (weeks < 4) return `${toFaDigits(weeks)} هفته پیش`;
  return formatJalaliDate(date);
}
