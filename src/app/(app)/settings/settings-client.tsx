'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  User, Lock, Bell, Eye, Sliders, Palette,
  LogOut, Trash2, Shield, CheckCircle2, Info,
  Monitor, Moon, Sun, Save, AlertTriangle,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { updateProfileSchema, type UpdateProfileFormValues } from '@/lib/validators';
import { useMe, useUpdateMe } from '@/hooks/use-user-data';
import { useLogoutAll } from '@/hooks/use-auth';
import { useDeleteAccount } from '@/hooks/use-account';
import {
  usePreferencesStore,
  type ThemeMode, type AccentColor, type AudioQuality,
} from '@/stores/preferences.store';
import { ROLE_LABELS } from '@/lib/constants';

// ─── Section types ────────────────────────────────────────────────────────────

type Section =
  | 'profile'
  | 'account'
  | 'appearance'
  | 'playback'
  | 'notifications'
  | 'privacy';

const NAV: { id: Section; label: string; icon: React.ElementType }[] = [
  { id: 'profile',       label: 'Profile',        icon: User    },
  { id: 'account',       label: 'Account',         icon: Shield  },
  { id: 'appearance',    label: 'Appearance',      icon: Palette },
  { id: 'playback',      label: 'Playback',        icon: Sliders },
  { id: 'notifications', label: 'Notifications',   icon: Bell    },
  { id: 'privacy',       label: 'Privacy',         icon: Eye     },
];

// ─── Shared UI primitives ─────────────────────────────────────────────────────

function SectionCard({
  title, description, badge, children,
}: { title: string; description?: string; badge?: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <div className="px-6 py-4 border-b border-border bg-secondary/20">
        <div className="flex items-center gap-2">
          <h2 className="text-base font-semibold text-foreground">{title}</h2>
          {badge && (
            <span className="rounded-full bg-amber-500/15 px-2 py-0.5 text-[10px] font-semibold text-amber-500 uppercase tracking-wider">
              {badge}
            </span>
          )}
        </div>
        {description && (
          <p className="mt-0.5 text-sm text-muted-foreground">{description}</p>
        )}
      </div>
      <div className="p-6 space-y-5">{children}</div>
    </div>
  );
}

function FieldRow({ label, hint, children }: {
  label: string; hint?: string; children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-start gap-3 sm:gap-6">
      <div className="sm:w-52 shrink-0">
        <p className="text-sm font-medium text-foreground">{label}</p>
        {hint && <p className="mt-0.5 text-xs text-muted-foreground leading-snug">{hint}</p>}
      </div>
      <div className="flex-1 min-w-0">{children}</div>
    </div>
  );
}

function InputField({
  error, disabled, ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { error?: boolean }) {
  return (
    <input
      {...props}
      disabled={disabled}
      className={cn(
        'w-full rounded-md bg-secondary border px-3 py-2.5 text-sm text-foreground',
        'placeholder:text-muted-foreground/50 outline-none transition-colors',
        'focus:border-primary/60 focus:ring-2 focus:ring-ring/20',
        error ? 'border-destructive' : 'border-border',
        disabled && 'opacity-50 cursor-not-allowed',
      )}
    />
  );
}

function Toggle({ checked, onChange, disabled }: {
  checked: boolean; onChange: (v: boolean) => void; disabled?: boolean;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => !disabled && onChange(!checked)}
      disabled={disabled}
      className={cn(
        'relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full transition-colors duration-200',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
        checked ? 'bg-primary' : 'bg-secondary border border-border',
        disabled && 'opacity-50 cursor-not-allowed',
      )}
    >
      <span className={cn(
        'pointer-events-none absolute top-0.5 left-0.5 h-4 w-4 rounded-full bg-white shadow-sm',
        'transition-transform duration-200',
        checked ? 'translate-x-4' : 'translate-x-0',
      )} />
    </button>
  );
}

function LocalBadge() {
  return (
    <span className="inline-flex items-center gap-1 text-[10px] text-muted-foreground/60 font-medium">
      <Info className="h-2.5 w-2.5" /> Saved locally
    </span>
  );
}

function SaveBtn({ loading, disabled }: { loading?: boolean; disabled?: boolean }) {
  return (
    <button type="submit" disabled={loading || disabled}
      className="flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90 transition-opacity disabled:opacity-40">
      {loading
        ? <span className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
        : <Save className="h-4 w-4" />}
      {loading ? 'Saving…' : 'Save changes'}
    </button>
  );
}

// ─── Profile section ──────────────────────────────────────────────────────────

function ProfileSection() {
  const { data: user, isLoading } = useMe();
  const updateMe = useUpdateMe();

  const { register, handleSubmit, reset, formState: { errors, isDirty, isSubmitting } } =
    useForm<UpdateProfileFormValues>({
      resolver: zodResolver(updateProfileSchema),
      defaultValues: { firstName: '', lastName: '', avatarUrl: '' },
    });

  useEffect(() => {
    if (user) reset({
      firstName: user.firstName ?? '',
      lastName:  user.lastName  ?? '',
      avatarUrl: user.avatarUrl ?? '',
    });
  }, [user, reset]);

  const onSubmit = async (values: UpdateProfileFormValues) => {
    await updateMe.mutateAsync({
      firstName: values.firstName || undefined,
      lastName:  values.lastName  || undefined,
      avatarUrl: values.avatarUrl || undefined,
    });
    reset(values);
  };

  if (isLoading) return (
    <SectionCard title="Profile">
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-10 rounded-md bg-secondary animate-pulse" />
        ))}
      </div>
    </SectionCard>
  );

  return (
    <SectionCard title="Profile"
      description="Your display name and avatar. Changes apply across the platform.">
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
        <FieldRow label="First name">
          <InputField {...register('firstName')} type="text" placeholder="Jane"
            error={!!errors.firstName} disabled={isSubmitting || updateMe.isPending} />
          {errors.firstName && <p className="mt-1 text-xs text-destructive">{errors.firstName.message}</p>}
        </FieldRow>

        <FieldRow label="Last name">
          <InputField {...register('lastName')} type="text" placeholder="Doe"
            error={!!errors.lastName} disabled={isSubmitting || updateMe.isPending} />
        </FieldRow>

        <FieldRow label="Avatar URL"
          hint="Paste a URL to an image. Square images work best.">
          <InputField {...register('avatarUrl')} type="url" placeholder="https://…"
            error={!!errors.avatarUrl} disabled={isSubmitting || updateMe.isPending} />
          {errors.avatarUrl && <p className="mt-1 text-xs text-destructive">{errors.avatarUrl.message}</p>}
          {user?.avatarUrl && (
            <div className="mt-2 flex items-center gap-2">
              <img src={user.avatarUrl} alt="" className="h-8 w-8 rounded-full object-cover border border-border" />
              <span className="text-xs text-muted-foreground">Current avatar</span>
            </div>
          )}
        </FieldRow>

        <div className="flex justify-end pt-1">
          <SaveBtn loading={isSubmitting || updateMe.isPending} disabled={!isDirty} />
        </div>
      </form>
    </SectionCard>
  );
}

// ─── Account section ──────────────────────────────────────────────────────────

function AccountSection() {
  const { data: user } = useMe();
  const logoutAll      = useLogoutAll();
  const deleteAccount  = useDeleteAccount();
  const [confirmDelete, setConfirmDelete] = useState(false);

  return (
    <div className="space-y-4">
      <SectionCard title="Account details"
        description="Read-only fields managed by the platform.">
        <FieldRow label="Email address"
          hint={user?.isEmailVerified ? undefined : 'Not verified'}>
          <div className="flex items-center gap-2">
            <InputField value={user?.email ?? ''} disabled readOnly
              className="flex-1" onChange={() => {}} />
            {user?.isEmailVerified && (
              <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" aria-label="Verified" />
            )}
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            Email cannot be changed from this interface.
          </p>
        </FieldRow>

        <FieldRow label="Username">
          <InputField value={user?.username ?? ''} disabled readOnly onChange={() => {}} />
          <p className="mt-1 text-xs text-muted-foreground">
            Username cannot be changed.
          </p>
        </FieldRow>

        <FieldRow label="Role">
          <div className="flex items-center gap-2">
            <span className={cn(
              'inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold',
              user?.role === 'ADMIN' || user?.role === 'MODERATOR'
                ? 'bg-violet-500/15 text-violet-400'
                : user?.role === 'ARTIST'
                  ? 'bg-blue-500/15 text-blue-400'
                  : 'bg-secondary text-muted-foreground border border-border',
            )}>
              {user?.role ? ROLE_LABELS[user.role] : '—'}
            </span>
          </div>
        </FieldRow>
      </SectionCard>

      <SectionCard title="Password"
        description="Password management is handled securely by the server.">
        <FieldRow label="Change password"
          hint="Use the Forgot Password flow to securely set a new password.">
          <a href="/forgot-password"
            className="inline-flex items-center gap-2 rounded-md border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-secondary hover:border-primary/40 transition-colors">
            <Lock className="h-4 w-4" />
            Reset via email
          </a>
          <p className="mt-2 text-xs text-muted-foreground">
            We'll send a secure link to your email address.
          </p>
        </FieldRow>
      </SectionCard>

      <SectionCard title="Sessions">
        <FieldRow label="Active sessions"
          hint="Sign out from all browsers and devices at once.">
          <button type="button" onClick={() => logoutAll.mutate()} disabled={logoutAll.isPending}
            className="flex items-center gap-2 rounded-md border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-secondary transition-colors disabled:opacity-50">
            <LogOut className="h-4 w-4" />
            {logoutAll.isPending ? 'Signing out…' : 'Sign out everywhere'}
          </button>
        </FieldRow>
      </SectionCard>

      <SectionCard title="Danger zone">
        <FieldRow label="Delete account"
          hint="Permanently delete your account and all associated data. This cannot be undone.">
          {confirmDelete ? (
            <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 space-y-3">
              <div className="flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
                <p className="text-sm text-foreground">
                  Are you sure? Your account, playlists, favorites, and history will be
                  permanently deleted.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button type="button" onClick={() => deleteAccount.mutate()}
                  disabled={deleteAccount.isPending}
                  className="rounded-md bg-destructive px-4 py-2 text-sm font-semibold text-destructive-foreground hover:opacity-90 disabled:opacity-50 transition-opacity">
                  {deleteAccount.isPending ? 'Deleting…' : 'Yes, delete my account'}
                </button>
                <button type="button" onClick={() => setConfirmDelete(false)}
                  className="rounded-md border border-border px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <button type="button" onClick={() => setConfirmDelete(true)}
              className="flex items-center gap-2 rounded-md border border-destructive/40 px-4 py-2 text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors">
              <Trash2 className="h-4 w-4" />
              Delete account
            </button>
          )}
        </FieldRow>
      </SectionCard>
    </div>
  );
}

// ─── Appearance section ───────────────────────────────────────────────────────

const THEME_OPTIONS: { value: ThemeMode; label: string; icon: React.ElementType }[] = [
  { value: 'dark',   label: 'Dark',   icon: Moon    },
  { value: 'light',  label: 'Light',  icon: Sun     },
  { value: 'system', label: 'System', icon: Monitor },
];

const ACCENT_OPTIONS: { value: AccentColor; label: string; cls: string }[] = [
  { value: 'violet',  label: 'Violet',  cls: 'bg-violet-500'  },
  { value: 'blue',    label: 'Blue',    cls: 'bg-blue-500'    },
  { value: 'emerald', label: 'Emerald', cls: 'bg-emerald-500' },
  { value: 'rose',    label: 'Rose',    cls: 'bg-rose-500'    },
  { value: 'amber',   label: 'Amber',   cls: 'bg-amber-500'   },
  { value: 'cyan',    label: 'Cyan',    cls: 'bg-cyan-500'    },
];

function AppearanceSection() {
  const { theme, accent, setTheme, setAccent } = usePreferencesStore();

  return (
    <SectionCard title="Appearance" badge="local"
      description="Visual preferences saved in your browser.">
      <FieldRow label="Theme" hint="Controls the colour scheme of the interface.">
        <div className="flex gap-2 flex-wrap">
          {THEME_OPTIONS.map(opt => {
            const Icon = opt.icon;
            return (
              <button key={opt.value} type="button" onClick={() => setTheme(opt.value)}
                className={cn(
                  'flex items-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-medium transition-all',
                  theme === opt.value
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-border text-muted-foreground hover:border-primary/40 hover:text-foreground',
                )}>
                <Icon className="h-4 w-4" />
                {opt.label}
              </button>
            );
          })}
        </div>
      </FieldRow>

      <FieldRow label="Accent colour" hint="Applied to interactive elements throughout the app.">
        <div className="flex gap-3 flex-wrap">
          {ACCENT_OPTIONS.map(opt => (
            <button key={opt.value} type="button" onClick={() => setAccent(opt.value)}
              aria-label={opt.label} title={opt.label}
              className={cn(
                'h-8 w-8 rounded-full transition-all ring-2 ring-offset-2 ring-offset-background',
                opt.cls,
                accent === opt.value ? 'ring-foreground scale-110' : 'ring-transparent hover:scale-105',
              )} />
          ))}
        </div>
      </FieldRow>
    </SectionCard>
  );
}

// ─── Playback section ─────────────────────────────────────────────────────────

const QUALITY_OPTIONS: { value: AudioQuality; label: string; hint: string }[] = [
  { value: 'auto',     label: 'Automatic', hint: 'Adjusts to your connection' },
  { value: 'normal',   label: 'Normal',    hint: '~96 kbps'  },
  { value: 'high',     label: 'High',      hint: '~320 kbps' },
  { value: 'lossless', label: 'Lossless',  hint: 'FLAC — Premium only' },
];

function PlaybackSection() {
  const { playback, setPlayback } = usePreferencesStore();

  return (
    <SectionCard title="Playback" badge="local"
      description="Playback preferences are stored locally and applied immediately.">

      <FieldRow label="Audio quality"
        hint="Higher quality uses more data and requires a faster connection.">
        <div className="grid grid-cols-2 gap-2">
          {QUALITY_OPTIONS.map(opt => (
            <button key={opt.value} type="button"
              onClick={() => setPlayback({ audioQuality: opt.value })}
              className={cn(
                'flex flex-col items-start rounded-lg border px-4 py-3 text-left transition-all',
                playback.audioQuality === opt.value
                  ? 'border-primary bg-primary/10'
                  : 'border-border hover:border-primary/40 hover:bg-secondary/50',
              )}>
              <span className={cn('text-sm font-semibold',
                playback.audioQuality === opt.value ? 'text-primary' : 'text-foreground')}>
                {opt.label}
              </span>
              <span className="text-xs text-muted-foreground mt-0.5">{opt.hint}</span>
            </button>
          ))}
        </div>
      </FieldRow>

      <FieldRow label="Crossfade"
        hint="Smoothly transition between tracks.">
        <div className="flex items-center gap-4">
          <input type="range" min={0} max={12} step={1}
            value={playback.crossfadeSec}
            onChange={e => setPlayback({ crossfadeSec: Number(e.target.value) })}
            className="flex-1 accent-primary cursor-pointer" />
          <span className="w-16 shrink-0 text-sm text-muted-foreground tabular-nums">
            {playback.crossfadeSec === 0 ? 'Off' : `${playback.crossfadeSec}s`}
          </span>
        </div>
      </FieldRow>

      <FieldRow label="Autoplay" hint="Keep playing related tracks when the queue ends.">
        <Toggle checked={playback.autoplayRelated}
          onChange={v => setPlayback({ autoplayRelated: v })} />
      </FieldRow>

      <FieldRow label="Normalise volume"
        hint="Equalise loudness between tracks to reduce jarring volume jumps.">
        <Toggle checked={playback.normalizeVolume}
          onChange={v => setPlayback({ normalizeVolume: v })} />
      </FieldRow>

      <FieldRow label="Explicit content"
        hint="Show tracks marked as explicit in search and recommendations.">
        <Toggle checked={playback.showExplicitContent}
          onChange={v => setPlayback({ showExplicitContent: v })} />
      </FieldRow>

      <LocalBadge />
    </SectionCard>
  );
}

// ─── Notifications section ────────────────────────────────────────────────────

const NOTIF_ROWS: { key: keyof import('@/stores/preferences.store').NotifDisplayPrefs; label: string; hint: string }[] = [
  { key: 'newFollower',         label: 'New followers',          hint: 'When someone follows you'               },
  { key: 'newRelease',          label: 'New releases',           hint: 'From artists you follow'                },
  { key: 'playlistAdd',         label: 'Playlist additions',     hint: 'When your track is added to a playlist' },
  { key: 'commentReply',        label: 'Comment replies',        hint: 'When someone replies to your comment'   },
  { key: 'likeReceived',        label: 'Likes',                  hint: 'When someone likes your content'        },
  { key: 'subscriptionRenewed', label: 'Subscription renewed',   hint: 'Billing confirmations'                  },
  { key: 'paymentFailed',       label: 'Payment failures',       hint: 'Important billing alerts'               },
  { key: 'systemMessages',      label: 'System messages',        hint: 'Platform updates and announcements'     },
];

function NotificationsSection() {
  const { notifs, setNotifs } = usePreferencesStore();

  return (
    <SectionCard title="Notification preferences" badge="local"
      description="Choose which notifications appear in your notification centre. These settings are stored locally.">
      <div className="space-y-4">
        {NOTIF_ROWS.map(row => (
          <FieldRow key={row.key} label={row.label} hint={row.hint}>
            <Toggle checked={notifs[row.key]}
              onChange={v => setNotifs({ [row.key]: v })} />
          </FieldRow>
        ))}
      </div>
      <LocalBadge />
    </SectionCard>
  );
}

// ─── Privacy section ──────────────────────────────────────────────────────────

const PRIVACY_ROWS: { key: keyof import('@/stores/preferences.store').PrivacyPrefs; label: string; hint: string }[] = [
  { key: 'showListeningActivity', label: 'Listening activity',  hint: 'Let others see what you are playing'        },
  { key: 'showPlaylists',         label: 'Public playlists',    hint: 'Show your public playlists on your profile' },
  { key: 'showFavorites',         label: 'Favorites',           hint: 'Show your liked tracks on your profile'     },
  { key: 'allowDataAnalytics',    label: 'Usage analytics',     hint: 'Help improve the platform with anonymous usage data' },
];

function PrivacySection() {
  const { privacy, setPrivacy } = usePreferencesStore();

  return (
    <SectionCard title="Privacy" badge="local"
      description="Control what others can see. These preferences are stored in your browser.">
      <div className="space-y-4">
        {PRIVACY_ROWS.map(row => (
          <FieldRow key={row.key} label={row.label} hint={row.hint}>
            <Toggle checked={privacy[row.key]}
              onChange={v => setPrivacy({ [row.key]: v })} />
          </FieldRow>
        ))}
      </div>
      <LocalBadge />
    </SectionCard>
  );
}

// ─── SettingsClient ───────────────────────────────────────────────────────────

export function SettingsClient() {
  const [active, setActive] = useState<Section>('profile');

  const SECTION_MAP: Record<Section, React.ReactNode> = {
    profile:       <ProfileSection />,
    account:       <AccountSection />,
    appearance:    <AppearanceSection />,
    playback:      <PlaybackSection />,
    notifications: <NotificationsSection />,
    privacy:       <PrivacySection />,
  };

  return (
    <div className="px-4 py-8 lg:px-8 max-w-[1100px]">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage your account and preferences.
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 items-start">
        {/* Sidebar nav */}
        <nav className="lg:w-52 shrink-0 w-full" aria-label="Settings sections">
          {/* Mobile: horizontal scroll */}
          <div className="flex lg:flex-col gap-1 overflow-x-auto pb-2 lg:pb-0">
            {NAV.map(item => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActive(item.id)}
                  className={cn(
                    'flex items-center gap-2.5 rounded-md px-3 py-2.5 text-sm font-medium',
                    'transition-colors whitespace-nowrap shrink-0 lg:w-full',
                    active === item.id
                      ? 'bg-primary/10 text-primary'
                      : 'text-muted-foreground hover:text-foreground hover:bg-secondary',
                  )}
                >
                  <Icon className="h-4 w-4 shrink-0" aria-hidden />
                  {item.label}
                </button>
              );
            })}
          </div>
        </nav>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {SECTION_MAP[active]}
        </div>
      </div>
    </div>
  );
}
