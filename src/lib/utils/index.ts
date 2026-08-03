import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

// ─── Class name merger ────────────────────────────────────────────────────────
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// ─── Duration formatting ──────────────────────────────────────────────────────
/** Converts seconds → "m:ss" or "h:mm:ss" */
export function formatDuration(seconds: number): string {
  if (!seconds || seconds < 0) return '0:00';
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  return `${m}:${String(s).padStart(2, '0')}`;
}

// ─── Number formatting ────────────────────────────────────────────────────────
/** Formats large numbers: 1_200_000 → "1.2M" */
export function formatCount(n: number | string): string {
  const num = typeof n === 'string' ? parseInt(n, 10) : n;
  if (isNaN(num)) return '0';
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`;
  if (num >= 1_000) return `${(num / 1_000).toFixed(1)}K`;
  return num.toString();
}

/** Formats money from cents: 999 → "$9.99" */
export function formatCents(cents: number, currency = 'usd'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency.toUpperCase(),
  }).format(cents / 100);
}

// ─── Date formatting ──────────────────────────────────────────────────────────
export function formatDate(date: string | Date, options?: Intl.DateTimeFormatOptions): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    ...options,
  }).format(new Date(date));
}

export function formatRelativeTime(date: string | Date): string {
  const d = new Date(date);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return formatDate(date);
}

// ─── String utilities ─────────────────────────────────────────────────────────
export function truncate(str: string, len: number): string {
  return str.length > len ? `${str.slice(0, len)}…` : str;
}

export function slugify(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((w) => w[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

// ─── URL / Image helpers ──────────────────────────────────────────────────────
export function getAvatarFallbackUrl(username: string): string {
  return `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(username)}`;
}

// ─── Type guards ──────────────────────────────────────────────────────────────
export function isApiError(err: unknown): err is { response: { data: { message: string | string[] } } } {
  return (
    typeof err === 'object' &&
    err !== null &&
    'response' in err &&
    typeof (err as Record<string, unknown>).response === 'object'
  );
}

export function extractApiError(err: unknown, fallback = 'خطایی رخ داد. لطفاً دوباره تلاش کنید.'): string {
  if (isApiError(err)) {
    const msg = err.response.data.message;
    if (Array.isArray(msg)) return msg[0];
    if (typeof msg === 'string') return msg;
  }
  if (err instanceof Error) return err.message;
  return fallback;
}

// ─── Misc ─────────────────────────────────────────────────────────────────────
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

export function noop() {}
