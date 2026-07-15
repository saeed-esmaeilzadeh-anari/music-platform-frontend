import type { Role, SubscriptionPlan, TrackStatus, UploadStatus } from '@/types';

export const ROUTES = {
  // Auth
  LOGIN:            '/login',
  REGISTER:         '/register',
  LOGOUT:           '/logout',
  FORGOT_PASSWORD:  '/forgot-password',
  BILLING_SUCCESS:  '/billing/success',
  BILLING_CANCEL:   '/billing/cancel',

  // App
  HOME:          '/home',
  BROWSE:        '/browse',
  SEARCH:        '/search',
  LIBRARY:       '/library',
  PROFILE:       '/profile',
  SETTINGS:      '/settings',
  HISTORY:       '/history',
  NOTIFICATIONS: '/notifications',
  UPLOAD:        '/upload',
  SUBSCRIPTION:  '/subscription',
  PAYMENTS:      '/payments',

  // Dynamic
  ARTIST:   (id: string) => `/artist/${id}`,
  ALBUM:    (id: string) => `/album/${id}`,
  TRACK:    (id: string) => `/track/${id}`,
  PLAYLIST: (id: string) => `/playlist/${id}`,

  // Admin
  ADMIN:        '/admin/dashboard',
  ADMIN_USERS:  '/admin/users',
  ADMIN_GENRES: '/admin/genres',
} as const;

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000/api/v1';

export const DEFAULT_PAGE_SIZE = 20;
export const DEFAULT_PAGE = 1;

export const PLAY_REGISTER_THRESHOLD_SEC = 30;
export const PLAYER_PROGRESS_INTERVAL_MS = 500;

export const ACCEPTED_AUDIO_TYPES = ['audio/mpeg','audio/mp3','audio/wav','audio/flac','audio/aac'];
export const ACCEPTED_IMAGE_TYPES = ['image/jpeg','image/jpg','image/png','image/webp'];
export const MAX_AUDIO_SIZE_BYTES = 100 * 1024 * 1024;
export const MAX_IMAGE_SIZE_BYTES = 5  * 1024 * 1024;

export const ROLE_LABELS: Record<Role, string> = {
  LISTENER:  'Listener',
  ARTIST:    'Artist',
  MODERATOR: 'Moderator',
  ADMIN:     'Admin',
};

export const PLAN_LABELS: Record<SubscriptionPlan, string> = {
  FREE:             'Free',
  PREMIUM_MONTHLY:  'Premium Monthly',
  PREMIUM_YEARLY:   'Premium Yearly',
  FAMILY:           'Family',
};

export const PLAN_PRICES: Record<string, string> = {
  PREMIUM_MONTHLY: '$9.99/mo',
  PREMIUM_YEARLY:  '$99.99/yr',
  FAMILY:          '$14.99/mo',
};

export const TRACK_STATUS_LABELS: Record<TrackStatus, string> = {
  DRAFT:      'Draft',
  PROCESSING: 'Processing',
  PUBLISHED:  'Published',
  REJECTED:   'Rejected',
  ARCHIVED:   'Archived',
};

export const UPLOAD_STATUS_LABELS: Record<UploadStatus, string> = {
  PENDING:    'Pending',
  UPLOADED:   'Uploaded',
  PROCESSING: 'Processing',
  READY:      'Ready',
  FAILED:     'Failed',
};

export const TOKEN_STORAGE_KEY = {
  ACCESS:  'ms_access_token',
  REFRESH: 'ms_refresh_token',
} as const;

export const STALE_TIME = {
  STATIC:   1000 * 60 * 10,
  STANDARD: 1000 * 60 * 2,
  SHORT:    1000 * 30,
  INSTANT:  0,
} as const;
