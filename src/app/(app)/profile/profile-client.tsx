'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Camera, LogOut, Shield, Calendar } from 'lucide-react';
import { useMe, useUpdateMe, useListeningHistory } from '@/hooks/use-user-data';
import { useLogoutAll } from '@/hooks/use-auth';
import { updateProfileSchema, type UpdateProfileFormValues } from '@/lib/validators';
import { getInitials, formatDate, formatRelativeTime, cn } from '@/lib/utils/index';
import { ROUTES, ROLE_LABELS } from '@/lib/constants';
import { TrackRow } from '@/components/track/track-card';
import { TrackRowSkeleton } from '@/components/shared/skeleton';
import { EmptyState } from '@/components/shared/empty-state';
import Link from 'next/link';
import type { TrackResponse } from '@/types';

// ─── Avatar section ───────────────────────────────────────────────────────────

function AvatarSection({ username, avatarUrl }: { username: string; avatarUrl?: string | null }) {
  return (
    <div className="relative mx-auto w-fit mb-6">
      <div className="h-24 w-24 rounded-full bg-primary/20 border-2 border-primary/30 flex items-center justify-center text-2xl font-bold text-primary overflow-hidden">
        {avatarUrl
          ? <img src={avatarUrl} alt={username} className="h-full w-full object-cover" />
          : getInitials(username)}
      </div>
      <div className="absolute bottom-0 right-0 flex h-7 w-7 items-center justify-center rounded-full bg-secondary border border-border cursor-pointer hover:bg-secondary/80 transition-colors" title="Change avatar">
        <Camera className="h-3.5 w-3.5 text-muted-foreground" />
      </div>
    </div>
  );
}

// ─── Edit form ────────────────────────────────────────────────────────────────

function EditProfileForm() {
  const { data: user, isLoading } = useMe();
  const updateMe = useUpdateMe();

  const { register, handleSubmit, reset, formState: { errors, isDirty, isSubmitting } } = useForm<UpdateProfileFormValues>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: { firstName: '', lastName: '', avatarUrl: '' },
  });

  useEffect(() => {
    if (user) reset({ firstName: user.firstName ?? '', lastName: user.lastName ?? '', avatarUrl: user.avatarUrl ?? '' });
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
    <div className="space-y-4">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="h-10 rounded-md bg-secondary skeleton" />
      ))}
    </div>
  );

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium uppercase tracking-widest text-muted-foreground mb-1.5">
            First name
          </label>
          <input
            {...register('firstName')}
            placeholder="Jane"
            className="w-full rounded-md bg-secondary border border-border px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 outline-none focus:border-primary/50 focus:ring-2 focus:ring-ring/20"
          />
        </div>
        <div>
          <label className="block text-xs font-medium uppercase tracking-widest text-muted-foreground mb-1.5">
            Last name
          </label>
          <input
            {...register('lastName')}
            placeholder="Doe"
            className="w-full rounded-md bg-secondary border border-border px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 outline-none focus:border-primary/50 focus:ring-2 focus:ring-ring/20"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium uppercase tracking-widest text-muted-foreground mb-1.5">
          Avatar URL
        </label>
        <input
          {...register('avatarUrl')}
          type="url"
          placeholder="https://…"
          className="w-full rounded-md bg-secondary border border-border px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 outline-none focus:border-primary/50 focus:ring-2 focus:ring-ring/20"
        />
        {errors.avatarUrl && (
          <p className="mt-1 text-xs text-destructive">{errors.avatarUrl.message}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={!isDirty || isSubmitting || updateMe.isPending}
        className="rounded-md bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90 transition-opacity disabled:opacity-40"
      >
        {isSubmitting || updateMe.isPending ? 'Saving…' : 'Save changes'}
      </button>
    </form>
  );
}

// ─── Listening history preview ────────────────────────────────────────────────

function RecentHistory() {
  const { data, isLoading } = useListeningHistory({ limit: 5 });

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold">Recent plays</h2>
        <Link href={ROUTES.HISTORY} className="text-xs text-muted-foreground hover:text-foreground transition-colors">
          View all →
        </Link>
      </div>
      {isLoading
        ? Array.from({ length: 5 }).map((_, i) => <TrackRowSkeleton key={i} />)
        : !data?.items.length
          ? <EmptyState title="No history yet" description="Start listening to build your history." className="py-8" />
          : data.items.map((h) => (
              <div key={h.id} className="flex items-center gap-3 rounded-md px-3 py-2.5 hover:bg-secondary/50 transition-colors">
                <div className="h-9 w-9 shrink-0 rounded bg-secondary border border-border" />
                <div className="flex-1 min-w-0">
                  <p className="truncate text-sm font-medium text-foreground">{h.trackId}</p>
                  <p className="text-xs text-muted-foreground">{formatRelativeTime(h.playedAt)}</p>
                </div>
                {h.completed && (
                  <span className="text-[10px] text-emerald-500 border border-emerald-500/30 rounded px-1.5 py-0.5">
                    Completed
                  </span>
                )}
              </div>
            ))}
    </div>
  );
}

// ─── ProfileClient ────────────────────────────────────────────────────────────

export function ProfileClient() {
  const { data: user } = useMe();
  const logoutAll = useLogoutAll();

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 lg:px-8 space-y-10">
      {/* Header */}
      <div className="text-center">
        <AvatarSection username={user?.username ?? '?'} avatarUrl={user?.avatarUrl} />
        <h1 className="text-2xl font-bold tracking-tight">{user?.username}</h1>
        <p className="text-sm text-muted-foreground mt-1">{user?.email}</p>
        <div className="flex items-center justify-center gap-3 mt-3 flex-wrap">
          {user && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/15 px-2.5 py-1 text-xs font-medium text-primary">
              <Shield className="h-3 w-3" />
              {ROLE_LABELS[user.role]}
            </span>
          )}
          {user?.createdAt && (
            <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
              <Calendar className="h-3 w-3" />
              Joined {formatDate(user.createdAt)}
            </span>
          )}
          {user?.isEmailVerified && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/15 px-2.5 py-1 text-xs font-medium text-emerald-500">
              ✓ Verified
            </span>
          )}
        </div>
      </div>

      {/* Edit profile */}
      <section className="rounded-xl border border-border bg-card p-6">
        <h2 className="text-base font-semibold mb-5">Edit profile</h2>
        <EditProfileForm />
      </section>

      {/* Recent history */}
      <section className="rounded-xl border border-border bg-card p-6">
        <RecentHistory />
      </section>

      {/* Danger zone */}
      <section className="rounded-xl border border-destructive/30 bg-destructive/5 p-6">
        <h2 className="text-base font-semibold mb-1 text-destructive">Sign out everywhere</h2>
        <p className="text-sm text-muted-foreground mb-4">
          Revoke all active sessions across all devices. You will be signed out immediately.
        </p>
        <button
          type="button"
          onClick={() => logoutAll.mutate()}
          disabled={logoutAll.isPending}
          className="flex items-center gap-2 rounded-md border border-destructive/50 px-4 py-2 text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors disabled:opacity-50"
        >
          <LogOut className="h-4 w-4" />
          {logoutAll.isPending ? 'Signing out…' : 'Sign out everywhere'}
        </button>
      </section>
    </div>
  );
}