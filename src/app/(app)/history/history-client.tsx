'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import {
  History, Play, Pause, Clock, BarChart2,
  RotateCcw, Music2, ChevronRight, CheckCircle2,
} from 'lucide-react';
import {
  useRecentlyPlayed,
  useContinueListening,
  useMostPlayed,
  useHistoryInfinite,
  type EnrichedHistory,
  type MostPlayedEntry,
} from '@/hooks/use-listening-history';
import { usePlayerStore } from '@/stores/player.store';
import { cn, formatDuration, formatRelativeTime, formatCount } from '@/lib/utils';
import type { TrackResponse } from '@/types';

// ─── Shared helpers ───────────────────────────────────────────────────────────

function ProgressRing({ pct, size = 36 }: { pct: number; size?: number }) {
  const r   = (size - 4) / 2;
  const circ = 2 * Math.PI * r;
  return (
    <svg width={size} height={size} className="-rotate-90" aria-hidden>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none"
        stroke="hsl(var(--secondary))" strokeWidth={3} />
      <circle cx={size / 2} cy={size / 2} r={r} fill="none"
        stroke="hsl(var(--primary))" strokeWidth={3}
        strokeDasharray={circ}
        strokeDashoffset={circ * (1 - Math.min(pct, 1))}
        strokeLinecap="round"
        style={{ transition: 'stroke-dashoffset 0.4s ease' }} />
    </svg>
  );
}

function TrackSkeleton() {
  return (
    <div className="flex items-center gap-3 px-3 py-2.5">
      <div className="h-10 w-10 shrink-0 rounded bg-secondary animate-pulse" />
      <div className="flex-1 space-y-1.5 min-w-0">
        <div className="h-3.5 w-36 rounded bg-secondary animate-pulse" />
        <div className="h-3 w-24 rounded bg-secondary animate-pulse" />
      </div>
      <div className="h-3 w-10 rounded bg-secondary animate-pulse shrink-0" />
    </div>
  );
}

function CardSkeleton() {
  return (
    <div className="space-y-3">
      <div className="aspect-square w-full rounded-md bg-secondary animate-pulse" />
      <div className="space-y-1.5">
        <div className="h-3.5 w-3/4 rounded bg-secondary animate-pulse" />
        <div className="h-3 w-1/2 rounded bg-secondary animate-pulse" />
      </div>
    </div>
  );
}

function SectionHeader({ title, icon: Icon, count }: {
  title: string; icon: React.ElementType; count?: number;
}) {
  return (
    <div className="flex items-center gap-2.5 mb-4">
      <Icon className="h-5 w-5 text-primary shrink-0" aria-hidden />
      <h2 className="text-lg font-bold tracking-tight">{title}</h2>
      {count !== undefined && (
        <span className="rounded-full bg-secondary border border-border px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
          {count}
        </span>
      )}
    </div>
  );
}

// ─── Recently Played section ──────────────────────────────────────────────────

function RecentlyPlayedSection() {
  const { data, isLoading } = useRecentlyPlayed();
  const { currentTrack, isPlaying, play, pause, resume } = usePlayerStore();

  if (isLoading) {
    return (
      <section>
        <SectionHeader title="Recently Played" icon={History} />
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {Array.from({ length: 6 }).map((_, i) => <CardSkeleton key={i} />)}
        </div>
      </section>
    );
  }

  if (!data?.length) return null;

  return (
    <section>
      <SectionHeader title="Recently Played" icon={History} count={data.length} />
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        {data.map(entry => {
          const track = entry.track;
          if (!track) return null;
          const isCurrent = currentTrack?.id === track.id;
          const isActive  = isCurrent && isPlaying;

          return (
            <Link key={entry.id} href={`/track/${track.id}`} className="group block space-y-2">
              <div className="relative aspect-square overflow-hidden rounded-md bg-secondary">
                {track.coverUrl
                  ? <img src={track.coverUrl} alt={track.title} className="h-full w-full object-cover" />
                  : <Music2 className="h-1/3 w-1/3 text-muted-foreground/20 absolute inset-0 m-auto" />}
                <button
                  type="button"
                  onClick={e => {
                    e.preventDefault();
                    if (isCurrent) { isPlaying ? pause() : resume(); }
                    else play(track, data.map(e => e.track).filter(Boolean) as TrackResponse[]);
                  }}
                  aria-label={isActive ? 'Pause' : `Play ${track.title}`}
                  className={cn(
                    'absolute bottom-2 right-2 flex h-9 w-9 items-center justify-center rounded-full',
                    'bg-primary text-primary-foreground shadow-lg',
                    'translate-y-2 opacity-0 transition-all duration-200',
                    'group-hover:translate-y-0 group-hover:opacity-100',
                    isCurrent && 'translate-y-0 opacity-100',
                  )}
                >
                  {isActive
                    ? <Pause className="h-4 w-4 fill-current" />
                    : <Play  className="h-4 w-4 fill-current translate-x-px" />}
                </button>
              </div>
              <div className="min-w-0">
                <p className={cn('truncate text-sm font-medium', isCurrent && 'text-primary')}>
                  {track.title}
                </p>
                <p className="truncate text-xs text-muted-foreground">
                  {formatRelativeTime(entry.playedAt)}
                </p>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}

// ─── Continue Listening section ───────────────────────────────────────────────

function ContinueListeningSection() {
  const { data, isLoading } = useContinueListening();
  const { currentTrack, isPlaying, play, pause, resume } = usePlayerStore();

  if (isLoading) {
    return (
      <section>
        <SectionHeader title="Continue Listening" icon={RotateCcw} />
        <div className="space-y-1">
          {Array.from({ length: 4 }).map((_, i) => <TrackSkeleton key={i} />)}
        </div>
      </section>
    );
  }

  if (!data?.length) return null;

  return (
    <section>
      <SectionHeader title="Continue Listening" icon={RotateCcw} count={data.length} />
      <div className="rounded-xl border border-border bg-card divide-y divide-border/50 overflow-hidden">
        {data.map(entry => {
          const track = entry.track;
          if (!track) return null;
          const isCurrent = currentTrack?.id === track.id;
          const isActive  = isCurrent && isPlaying;
          const pct = track.durationSec > 0 ? entry.progressSec / track.durationSec : 0;

          return (
            <div key={entry.id}
              className={cn(
                'group flex items-center gap-3 px-4 py-3 hover:bg-secondary/50 transition-colors',
                isCurrent && 'bg-primary/5',
              )}
            >
              {/* Progress ring + play */}
              <button
                type="button"
                onClick={() => {
                  if (isCurrent) { isPlaying ? pause() : resume(); }
                  else play(track, [track]);
                }}
                aria-label={isActive ? 'Pause' : `Resume ${track.title}`}
                className="relative shrink-0"
              >
                <ProgressRing pct={pct} size={40} />
                <span className={cn(
                  'absolute inset-0 flex items-center justify-center',
                  'text-muted-foreground group-hover:text-primary transition-colors',
                  isCurrent && 'text-primary',
                )}>
                  {isActive
                    ? <Pause className="h-3.5 w-3.5 fill-current" />
                    : <Play  className="h-3.5 w-3.5 fill-current translate-x-px" />}
                </span>
              </button>

              {/* Cover */}
              <div className="h-10 w-10 shrink-0 overflow-hidden rounded bg-secondary border border-border">
                {track.coverUrl
                  ? <img src={track.coverUrl} alt="" className="h-full w-full object-cover" />
                  : <Music2 className="h-4 w-4 m-auto mt-3 text-muted-foreground/30" />}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <Link href={`/track/${track.id}`}
                  className={cn('block truncate text-sm font-medium hover:underline', isCurrent && 'text-primary')}>
                  {track.title}
                </Link>
                <p className="truncate text-xs text-muted-foreground">{track.artist.stageName}</p>
              </div>

              {/* Progress info */}
              <div className="hidden sm:flex flex-col items-end shrink-0 gap-0.5">
                <span className="text-xs tabular-nums text-muted-foreground">
                  {formatDuration(entry.progressSec)} / {formatDuration(track.durationSec)}
                </span>
                <span className="text-[10px] text-muted-foreground/60">
                  {Math.round(pct * 100)}% played
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

// ─── Most Played section ──────────────────────────────────────────────────────

function MostPlayedSection() {
  const { data, isLoading } = useMostPlayed(10);
  const { currentTrack, isPlaying, play, pause, resume } = usePlayerStore();

  if (isLoading) {
    return (
      <section>
        <SectionHeader title="Most Played" icon={BarChart2} />
        <div className="space-y-1">
          {Array.from({ length: 6 }).map((_, i) => <TrackSkeleton key={i} />)}
        </div>
      </section>
    );
  }

  if (!data?.length) return null;

  const maxCount = data[0]?.playCount ?? 1;

  return (
    <section>
      <SectionHeader title="Most Played" icon={BarChart2} />
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        {data.map((entry, i) => {
          const { track } = entry;
          if (!track) return null;
          const isCurrent = currentTrack?.id === track.id;
          const isActive  = isCurrent && isPlaying;
          const barPct    = maxCount > 0 ? entry.playCount / maxCount : 0;

          return (
            <div key={entry.trackId}
              className={cn(
                'group relative flex items-center gap-3 px-4 py-3',
                'border-b border-border/50 last:border-0',
                'hover:bg-secondary/40 transition-colors overflow-hidden',
                isCurrent && 'bg-primary/5',
              )}
            >
              {/* Background bar — subtle play count visualiser */}
              <div
                className="absolute inset-y-0 left-0 bg-primary/5 transition-[width] duration-500"
                style={{ width: `${barPct * 100}%` }}
                aria-hidden
              />

              {/* Rank */}
              <span className="relative z-10 w-5 shrink-0 text-right text-sm tabular-nums font-bold text-muted-foreground/40">
                {i + 1}
              </span>

              {/* Play */}
              <button type="button"
                onClick={() => {
                  if (isCurrent) { isPlaying ? pause() : resume(); }
                  else play(track, data.map(e => e.track).filter(Boolean) as TrackResponse[]);
                }}
                aria-label={isActive ? 'Pause' : `Play ${track.title}`}
                className="relative z-10 flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded bg-secondary border border-border">
                {track.coverUrl && (
                  <img src={track.coverUrl} alt="" className="absolute inset-0 h-full w-full object-cover" />
                )}
                <div className={cn(
                  'absolute inset-0 flex items-center justify-center',
                  'bg-black/0 group-hover:bg-black/60 transition-colors',
                  isCurrent && 'bg-black/40',
                )}>
                  {isActive
                    ? <Pause className="h-4 w-4 fill-current text-white" />
                    : <Play  className="h-4 w-4 fill-current text-white translate-x-px opacity-0 group-hover:opacity-100 transition-opacity" />}
                </div>
              </button>

              {/* Info */}
              <div className="relative z-10 flex-1 min-w-0">
                <Link href={`/track/${track.id}`}
                  className={cn('block truncate text-sm font-medium hover:underline', isCurrent && 'text-primary')}>
                  {track.title}
                </Link>
                <p className="truncate text-xs text-muted-foreground">{track.artist.stageName}</p>
              </div>

              {/* Play count badge */}
              <div className="relative z-10 hidden sm:flex flex-col items-end shrink-0 gap-0.5">
                <span className="text-sm font-semibold text-foreground tabular-nums">
                  {formatCount(entry.playCount)}
                </span>
                <span className="text-[10px] text-muted-foreground/60">plays</span>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

// ─── Full history — infinite scroll ──────────────────────────────────────────

function FullHistorySection() {
  const {
    data, isLoading, isFetchingNextPage,
    hasNextPage, fetchNextPage, isError,
  } = useHistoryInfinite();

  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && hasNextPage && !isFetchingNextPage) fetchNextPage();
      },
      { threshold: 0, rootMargin: '300px' },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const allItems = data?.pages.flatMap(p => p.items) ?? [];

  return (
    <section>
      <SectionHeader title="Full History" icon={Clock} count={data?.pages[0]?.meta.totalItems} />
      <div className="rounded-xl border border-border bg-card overflow-hidden">

        {/* Column header */}
        <div className="flex items-center gap-3 px-4 py-2 border-b border-border bg-secondary/30 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground/60">
          <span className="flex-1">Track</span>
          <span className="hidden sm:block w-28 text-right">Played</span>
          <span className="hidden md:block w-20 text-right">Progress</span>
          <span className="w-16 text-right">Status</span>
        </div>

        {isLoading && Array.from({ length: 8 }).map((_, i) => <TrackSkeleton key={i} />)}

        {isError && !isLoading && (
          <p className="px-4 py-8 text-sm text-muted-foreground text-center">
            Failed to load history.
          </p>
        )}

        {!isLoading && allItems.length === 0 && (
          <div className="flex flex-col items-center gap-4 py-16 text-center px-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-secondary border border-border">
              <History className="h-6 w-6 text-muted-foreground/40" />
            </div>
            <div>
              <p className="font-semibold">No listening history yet</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Start playing tracks and they'll appear here.
              </p>
            </div>
          </div>
        )}

        <div>
          {allItems.map(item => (
            <RawHistoryRow key={item.id} item={item} />
          ))}
        </div>

        {isFetchingNextPage && Array.from({ length: 3 }).map((_, i) => <TrackSkeleton key={`nxt-${i}`} />)}

        <div ref={sentinelRef} className="h-px" aria-hidden />

        {!hasNextPage && allItems.length > 0 && (
          <div className="flex items-center justify-center gap-2 py-4 border-t border-border/50">
            <CheckCircle2 className="h-3.5 w-3.5 text-muted-foreground/40" />
            <span className="text-xs text-muted-foreground/50">All history loaded</span>
          </div>
        )}
      </div>
    </section>
  );
}

function RawHistoryRow({ item }: { item: EnrichedHistory | { id: string; trackId: string; playedAt: string; progressSec: number; completed: boolean; track?: null } }) {
  const track = 'track' in item ? item.track : null;

  return (
    <div className="flex items-center gap-3 px-4 py-2.5 border-b border-border/40 last:border-0 hover:bg-secondary/30 transition-colors">
      {/* Cover placeholder or real image */}
      <div className="h-9 w-9 shrink-0 overflow-hidden rounded bg-secondary border border-border">
        {track?.coverUrl
          ? <img src={track.coverUrl} alt="" className="h-full w-full object-cover" />
          : <Music2 className="h-3.5 w-3.5 m-auto mt-2.5 text-muted-foreground/30" />}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        {track ? (
          <>
            <Link href={`/track/${track.id}`}
              className="block truncate text-sm font-medium hover:underline text-foreground">
              {track.title}
            </Link>
            <p className="truncate text-xs text-muted-foreground">{track.artist.stageName}</p>
          </>
        ) : (
          <>
            <p className="truncate text-sm text-muted-foreground font-mono text-[11px]">{item.trackId}</p>
            <p className="text-xs text-muted-foreground/50">Track unavailable</p>
          </>
        )}
      </div>

      {/* Played at */}
      <span className="hidden sm:block text-xs text-muted-foreground tabular-nums w-28 text-right shrink-0">
        {formatRelativeTime(item.playedAt)}
      </span>

      {/* Progress */}
      <span className="hidden md:block text-xs tabular-nums text-muted-foreground w-20 text-right shrink-0">
        {formatDuration(item.progressSec)}
        {track ? <span className="text-muted-foreground/40"> / {formatDuration(track.durationSec)}</span> : null}
      </span>

      {/* Completed badge */}
      <div className="w-16 flex justify-end shrink-0">
        {item.completed ? (
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-medium text-emerald-500">
            <CheckCircle2 className="h-2.5 w-2.5" /> Done
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 rounded-full bg-secondary border border-border px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
            <Clock className="h-2.5 w-2.5" /> Partial
          </span>
        )}
      </div>
    </div>
  );
}

// ─── HistoryClient ────────────────────────────────────────────────────────────

export function HistoryClient() {
  return (
    <div className="px-4 py-8 lg:px-8 max-w-[1100px] space-y-12">

      {/* Page header */}
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/15 border border-primary/20">
          <History className="h-6 w-6 text-primary" aria-hidden />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Listening History</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Your complete listening activity
          </p>
        </div>
      </div>

      {/* Four sections */}
      <RecentlyPlayedSection />
      <ContinueListeningSection />
      <MostPlayedSection />
      <FullHistorySection />
    </div>
  );
}
