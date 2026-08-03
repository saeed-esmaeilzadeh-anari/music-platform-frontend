/**
 * Persian (Farsi) display strings for the admin dashboard.
 * Kept separate from `lib/constants/index.ts` (English, listener-facing app).
 */

import type { AlbumType, Role, TrackStatus } from '@/types';

// ─── Enum labels ──────────────────────────────────────────────────────────────

export const FA_ROLE_LABELS: Record<Role, string> = {
  LISTENER: 'شنونده',
  ARTIST: 'هنرمند',
  MODERATOR: 'ناظر',
  ADMIN: 'مدیر',
};

export const FA_TRACK_STATUS_LABELS: Record<TrackStatus, string> = {
  DRAFT: 'پیش‌نویس',
  PROCESSING: 'در حال پردازش',
  PUBLISHED: 'منتشرشده',
  REJECTED: 'ردشده',
  ARCHIVED: 'بایگانی‌شده',
};

export const FA_ALBUM_TYPE_LABELS: Record<AlbumType, string> = {
  ALBUM: 'آلبوم',
  SINGLE: 'تک‌آهنگ',
  EP: 'EP',
  COMPILATION: 'گلچین',
};
