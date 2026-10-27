'use client';

import { useState, type FormEvent } from 'react';
import Link from 'next/link';
import {
  ArrowUpRight,
  BadgeCheck,
  CheckCircle2,
  Disc3,
  LoaderCircle,
  Music2,
  Sparkles,
  UploadCloud,
  UserRound,
  Users,
} from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useArtistProfile } from '@/hooks/use-artist-profile';
import { useCreateArtistProfile } from '@/hooks/use-artists';
import { useAuthStore } from '@/stores/auth.store';
import { authService } from '@/services/auth.service';
import { getRefreshToken } from '@/lib/api/http-client';
import { useToast } from '@/providers/toast-provider';
import { useLocale } from '@/providers/locale-provider';
import { queryKeys } from '@/lib/constants/query-keys';
import { ROUTES } from '@/lib/constants';

type ArtistProfilePanelProps = {
  variant?: 'profile' | 'upload';
};

export function ArtistProfilePanel({ variant = 'profile' }: ArtistProfilePanelProps) {
  const { artist, isLoading, isError, refetch } = useArtistProfile();
  const createArtist = useCreateArtistProfile();
  const user = useAuthStore((state) => state.user);
  const login = useAuthStore((state) => state.login);
  const queryClient = useQueryClient();
  const router = useRouter();
  const { error } = useToast();
  const { t, locale } = useLocale();
  const [stageName, setStageName] = useState('');
  const [bio, setBio] = useState('');
  const [nameError, setNameError] = useState('');
  const [isRefreshingAccess, setIsRefreshingAccess] = useState(false);

  const refreshArtistAccess = async () => {
    const refreshToken = getRefreshToken();
    if (!refreshToken) {
      router.push(ROUTES.LOGIN);
      return;
    }

    setIsRefreshingAccess(true);
    try {
      const refreshed = await authService.refresh({ refreshToken });
      login(refreshed.user, refreshed.accessToken, refreshed.refreshToken);
      await queryClient.invalidateQueries({ queryKey: queryKeys.users.me() });
      router.push(ROUTES.UPLOAD);
    } catch {
      error(t('artistProfile.sessionRefreshTitle'), t('artistProfile.sessionRefreshDescription'));
    } finally {
      setIsRefreshingAccess(false);
    }
  };

  const handleCreateProfile = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const normalizedName = stageName.trim();
    if (!normalizedName) {
      setNameError(t('artistProfile.stageNameRequired'));
      return;
    }

    setNameError('');
    createArtist.mutate({
      stageName: normalizedName,
      bio: bio.trim() || undefined,
    });
  };

  const numberLocale = locale === 'fa' ? 'fa-IR' : 'en-US';

  if (isLoading) {
    return (
      <section
        id="artist-profile"
        className="overflow-hidden rounded-2xl border border-border bg-card"
        aria-live="polite"
      >
        <div className="flex items-center gap-3 p-6 sm:p-8">
          <LoaderCircle className="h-5 w-5 animate-spin text-primary" aria-hidden="true" />
          <p className="text-sm text-muted-foreground">{t('artistProfile.loading')}</p>
        </div>
      </section>
    );
  }

  if (isError) {
    return (
      <section
        id="artist-profile"
        className="overflow-hidden rounded-2xl border border-border bg-card"
        aria-labelledby="artist-profile-error-title"
      >
        <div className="border-b border-border bg-gradient-to-r from-primary/15 via-primary/5 to-transparent p-6 sm:p-8">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">
            {t('artistProfile.eyebrow')}
          </p>
          <h2 id="artist-profile-error-title" className="mt-2 text-xl font-bold">
            {t('artistProfile.loadFailedTitle')}
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
            {t('artistProfile.loadFailedDescription')}
          </p>
          <button
            type="button"
            onClick={() => { void refetch(); }}
            className="mt-5 inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
          >
            {t('artistProfile.retry')}
          </button>
        </div>
      </section>
    );
  }

  if (artist) {
    const canUpload = user?.role === 'ARTIST' || user?.role === 'ADMIN';
    const monthlyListeners = new Intl.NumberFormat(numberLocale).format(artist.monthlyListeners ?? 0);

    return (
      <section
        id="artist-profile"
        className="overflow-hidden rounded-2xl border border-border bg-card"
        aria-labelledby="artist-profile-title"
      >
        <div className="relative overflow-hidden border-b border-border bg-gradient-to-br from-primary/20 via-card to-card px-6 pb-7 pt-6 sm:px-8 sm:pt-8">
          <div className="pointer-events-none absolute -right-12 -top-16 h-56 w-56 rounded-full bg-primary/10 blur-3xl" />
          <div className="relative flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div className="flex items-start gap-4">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border border-primary/25 bg-primary/10 text-primary shadow-sm sm:h-20 sm:w-20">
                <Music2 className="h-8 w-8 sm:h-9 sm:w-9" aria-hidden="true" />
              </div>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">
                    {t('artistProfile.eyebrow')}
                  </p>
                  {artist.isVerified && (
                    <span className="inline-flex items-center gap-1 rounded-full border border-sky-500/30 bg-sky-500/10 px-2 py-0.5 text-[11px] font-semibold text-sky-500">
                      <BadgeCheck className="h-3.5 w-3.5" aria-hidden="true" />
                      {t('artistProfile.verified')}
                    </span>
                  )}
                </div>
                <h2 id="artist-profile-title" className="mt-2 truncate text-2xl font-bold tracking-tight sm:text-3xl">
                  {artist.stageName}
                </h2>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
                  {artist.bio || t('artistProfile.noBio')}
                </p>
              </div>
            </div>
            <span className="inline-flex w-fit shrink-0 items-center gap-1.5 rounded-full border border-emerald-500/25 bg-emerald-500/10 px-3 py-1.5 text-xs font-semibold text-emerald-500">
              <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
              {t('artistProfile.active')}
            </span>
          </div>
        </div>

        <div className="grid gap-5 p-6 sm:grid-cols-[1fr_auto] sm:items-center sm:px-8">
          <div className="flex flex-wrap gap-3">
            <div className="min-w-36 rounded-xl border border-border bg-secondary/40 px-4 py-3">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Users className="h-4 w-4" aria-hidden="true" />
                <span className="text-xs">{t('artistProfile.monthlyListeners')}</span>
              </div>
              <p className="mt-1 text-xl font-bold tabular-nums">{monthlyListeners}</p>
            </div>
            <div className="min-w-36 rounded-xl border border-border bg-secondary/40 px-4 py-3">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Sparkles className="h-4 w-4" aria-hidden="true" />
                <span className="text-xs">{t('artistProfile.verifiedStatus')}</span>
              </div>
              <p className="mt-1 text-sm font-semibold">
                {artist.isVerified ? t('artistProfile.verified') : t('artistProfile.notVerified')}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Link
              href={ROUTES.ARTIST(artist.id)}
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-border px-4 py-2.5 text-sm font-semibold transition-colors hover:bg-secondary"
            >
              {t('artistProfile.openProfile')}
              <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
            </Link>
            {canUpload ? (
              <Link
                href={ROUTES.UPLOAD}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
              >
                <UploadCloud className="h-4 w-4" aria-hidden="true" />
                {t('artistProfile.goToUpload')}
              </Link>
            ) : (
              <button
                type="button"
                onClick={() => { void refreshArtistAccess(); }}
                disabled={isRefreshingAccess}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isRefreshingAccess && <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" />}
                {t('artistProfile.refreshAccess')}
              </button>
            )}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section
      id="artist-profile"
      className="overflow-hidden rounded-2xl border border-border bg-card"
      aria-labelledby="artist-profile-create-title"
    >
      <div className="relative overflow-hidden border-b border-border bg-gradient-to-br from-primary/20 via-primary/5 to-transparent px-6 py-7 sm:px-8 sm:py-9">
        <div className="pointer-events-none absolute -right-14 -top-20 h-64 w-64 rounded-full bg-primary/10 blur-3xl" />
        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-start">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-primary/25 bg-primary/10 text-primary shadow-sm">
            <UserRound className="h-7 w-7" aria-hidden="true" />
          </div>
          <div className="max-w-3xl">
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">
                {variant === 'upload' ? t('artistProfile.uploadGateEyebrow') : t('artistProfile.eyebrow')}
              </p>
              <span className="rounded-full border border-border bg-background/70 px-2.5 py-1 text-[11px] font-semibold text-muted-foreground">
                {t('artistProfile.setupRequired')}
              </span>
            </div>
            <h2 id="artist-profile-create-title" className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">
              {variant === 'upload' ? t('artistProfile.uploadGateTitle') : t('artistProfile.createTitle')}
            </h2>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              {variant === 'upload' ? t('artistProfile.uploadGateDescription') : t('artistProfile.createDescription')}
            </p>
            {user?.role === 'LISTENER' && (
              <p className="mt-3 flex items-start gap-2 text-xs leading-5 text-muted-foreground">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
                {t('artistProfile.listenerRoleNote')}
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="grid gap-8 p-6 sm:p-8 lg:grid-cols-[minmax(0,1.2fr)_minmax(260px,0.8fr)]">
        <form onSubmit={handleCreateProfile} className="space-y-5" noValidate>
          <div>
            <label htmlFor="artist-stage-name" className="mb-1.5 block text-sm font-semibold">
              {t('artistProfile.stageName')} <span className="text-destructive">*</span>
            </label>
            <input
              id="artist-stage-name"
              value={stageName}
              onChange={(event) => {
                setStageName(event.target.value);
                if (nameError) setNameError('');
              }}
              placeholder={t('artistProfile.stageNamePlaceholder')}
              maxLength={100}
              autoComplete="off"
              aria-invalid={!!nameError}
              aria-describedby="artist-stage-name-help"
              className={`w-full rounded-xl border bg-secondary/50 px-4 py-3 text-sm outline-none transition-colors placeholder:text-muted-foreground/60 focus:border-primary focus:ring-2 focus:ring-primary/20 ${nameError ? 'border-destructive' : 'border-border'}`}
            />
            <p id="artist-stage-name-help" className="mt-1.5 text-xs leading-5 text-muted-foreground">
              {t('artistProfile.stageNameHelp')}
            </p>
            {nameError && <p role="alert" className="mt-1 text-xs text-destructive">{nameError}</p>}
          </div>

          <div>
            <label htmlFor="artist-bio" className="mb-1.5 block text-sm font-semibold">
              {t('artistProfile.bio')}
            </label>
            <textarea
              id="artist-bio"
              value={bio}
              onChange={(event) => setBio(event.target.value)}
              placeholder={t('artistProfile.bioPlaceholder')}
              maxLength={2000}
              rows={4}
              className="w-full resize-y rounded-xl border border-border bg-secondary/50 px-4 py-3 text-sm outline-none transition-colors placeholder:text-muted-foreground/60 focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
            <div className="mt-1.5 flex items-center justify-between gap-3">
              <p className="text-xs leading-5 text-muted-foreground">{t('artistProfile.bioHelp')}</p>
              <span className="shrink-0 text-[11px] tabular-nums text-muted-foreground">{bio.length}/2000</span>
            </div>
          </div>

          <button
            type="submit"
            disabled={createArtist.isPending}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-bold text-primary-foreground shadow-sm transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
          >
            {createArtist.isPending ? (
              <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" />
            ) : (
              <Music2 className="h-4 w-4" aria-hidden="true" />
            )}
            {createArtist.isPending ? t('artistProfile.creating') : t('artistProfile.createButton')}
          </button>
        </form>

        <aside className="rounded-2xl border border-border bg-secondary/30 p-5 sm:p-6">
          <h3 className="text-sm font-bold">{t('artistProfile.nextSteps')}</h3>
          <div className="mt-5 space-y-5">
            <div className="flex items-start gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <UserRound className="h-4 w-4" aria-hidden="true" />
              </span>
              <div>
                <p className="text-sm font-semibold">{t('artistProfile.stepIdentity')}</p>
                <p className="mt-1 text-xs leading-5 text-muted-foreground">{t('artistProfile.stepIdentityDesc')}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-secondary text-muted-foreground">
                <Disc3 className="h-4 w-4" aria-hidden="true" />
              </span>
              <div>
                <p className="text-sm font-semibold">{t('artistProfile.stepArtwork')}</p>
                <p className="mt-1 text-xs leading-5 text-muted-foreground">{t('artistProfile.stepArtworkDesc')}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-secondary text-muted-foreground">
                <UploadCloud className="h-4 w-4" aria-hidden="true" />
              </span>
              <div>
                <p className="text-sm font-semibold">{t('artistProfile.stepRelease')}</p>
                <p className="mt-1 text-xs leading-5 text-muted-foreground">{t('artistProfile.stepReleaseDesc')}</p>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </section>
  );
}
