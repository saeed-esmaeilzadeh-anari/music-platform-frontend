'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Heart, Music2, Disc3, User,
  Trash2, Play, Pause, Clock,
} from 'lucide-react';
import {
  useFavoriteTracks,
  useFavoriteAlbumIds,
  useFavoriteArtistIds,
  useIsFavoriteTrack,
  useIsFavoriteAlbum,
  useIsFavoriteArtist,
} from '@/hooks/use-favorites';
import { useAlbum }  from '@/hooks/use-albums';
import { useArtist } from '@/hooks/use-artists';
import { cn, formatDuration, formatDate, formatCount } from '@/lib/utils';
import { FavoriteButton } from '@/components/shared/favorite-button';
import type { TrackResponse } from '@/types';

// ─── Tab type ─────────────────────────────────────────────────────────────────

type FavTab = 'tracks' | 'albums' | 'artists';

const TABS: { id: FavTab; label: string; icon: React.ElementType }[] = [
  { id: 'tracks',  label: 'Tracks',  icon: Music2 },
  { id: 'albums',  label: 'Albums',  icon: Disc3  },
  { id: 'artists', label: 'Artists', icon: User   },
];

// ─── Skeletons ─────────────────────────────────────────────────────────────────

function TrackSkeleton() {
  return (
    <div className="flex items-center gap-3 px-3 py-2.5 rounded-md">
      <div className="h-4 w-4 rounded bg-secondary animate-pulse shrink-0" />
      <div className="h-10 w-10 rounded bg-secondary animate-pulse shrink-0" />
      <div className="flex-1 space-y-1.5">
        <div className="h-3.5 w-40 rounded bg-secondary animate-pulse" />
        <div className="h-3 w-24 rounded bg-secondary animate-pulse" />
      </div>
      <div className="h-3 w-10 rounded bg-secondary animate-pulse shrink-0" />
    </div>
  );
}

function CardSkeleton({ round = false }: { round?: boolean }) {
  return (
    <div className="space-y-3">
      <div className={cn('aspect-square w-full bg-secondary animate-pulse', round ? 'rounded-full' : 'rounded-md')} />
      <div className="space-y-1.5 px-1">
        <div className="h-3.5 w-3/4 rounded bg-secondary animate-pulse" />
        <div className="h-3 w-1/2 rounded bg-secondary animate-pulse" />
      </div>
    </div>
  );
}

// ─── Empty state ───────────────────────────────────────────────────────────────

function EmptyFavorites({ type }: { type: FavTab }) {
  const config = {
    tracks:  { icon: Music2, label: 'No favorite tracks yet',   hint: 'Tap ♥ on any track to save it here.' },
    albums:  { icon: Disc3,  label: 'No favorite albums yet',   hint: 'Tap ♥ on any album to save it here.' },
    artists: { icon: User,   label: 'No favorite artists yet',  hint: 'Tap ♥ on any artist to save them here.' },
  }[type];

  const Icon = config.icon;

  return (
    <div className="flex flex-col items-center gap-4 py-20 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-secondary border border-border">
        <Icon className="h-7 w-7 text-muted-foreground/40" aria-hidden />
      </div>
      <div>
        <p className="font-semibold text-foreground">{config.label}</p>
        <p className="mt-1 text-sm text-muted-foreground">{config.hint}</p>
      </div>
    </div>
  );
}

// ─── Track row ─────────────────────────────────────────────────────────────────

function FavoriteTrackRow({ track, index, queue }: {
  track: TrackResponse; index: number; queue: TrackResponse[];
}) {
  const { isFavorited, toggle } = useIsFavoriteTrack(track.id);

  return (
    <div className="group flex items-center gap-3 rounded-md px-3 py-2.5 hover:bg-secondary transition-colors">
      {/* Index */}
      <span className="w-5 shrink-0 text-right text-sm tabular-nums text-muted-foreground">
        {index + 1}
      </span>

      {/* Cover */}
      <div className="h-10 w-10 shrink-0 overflow-hidden rounded bg-secondary border border-border">
        {track.coverUrl
          ? <img src={track.coverUrl} alt="" className="h-full w-full object-cover" />
          : <Music2 className="h-4 w-4 m-auto mt-3 text-muted-foreground/30" />}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <Link href={`/track/${track.id}`}
          className="block truncate text-sm font-medium text-foreground hover:underline leading-tight">
          {track.title}
        </Link>
        <Link href={`/artist/${track.artist.id}`}
          className="block truncate text-xs text-muted-foreground hover:text-foreground hover:underline">
          {track.artist.stageName}
        </Link>
      </div>

      {/* Duration */}
      <span className="hidden sm:block text-xs tabular-nums text-muted-foreground shrink-0 w-10 text-right">
        {formatDuration(track.durationSec)}
      </span>

      {/* Remove */}
      <button
        type="button"
        onClick={toggle}
        aria-label="Remove from favorites"
        className="shrink-0 opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-all"
      >
        <Trash2 className="h-3.5 w-3.5" aria-hidden />
      </button>
    </div>
  );
}

// ─── Album card ─────────────────────────────────────────────────────────────────

function FavoriteAlbumCard({ albumId }: { albumId: string }) {
  const { data: album, isLoading } = useAlbum(albumId);
  const { toggle } = useIsFavoriteAlbum(albumId);

  if (isLoading) return <CardSkeleton />;
  if (!album) return null;

  return (
    <div className="group relative space-y-3">
      <Link href={`/album/${album.id}`} className="block">
        <div className="relative aspect-square overflow-hidden rounded-md bg-secondary">
          {album.coverUrl
            ? <img src={album.coverUrl} alt={album.title} className="h-full w-full object-cover" />
            : <Disc3 className="h-1/3 w-1/3 text-muted-foreground/20 absolute inset-0 m-auto" />}
          <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg">
              <Play className="h-4 w-4 fill-current translate-x-px" />
            </div>
          </div>
        </div>
        <div className="px-1 mt-2">
          <p className="truncate text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
            {album.title}
          </p>
          <p className="truncate text-xs text-muted-foreground mt-0.5">
            {album.type} · {album.releaseDate ? formatDate(album.releaseDate, { year: 'numeric' }) : ''}
          </p>
        </div>
      </Link>

      {/* Remove button */}
      <button
        type="button"
        onClick={toggle}
        aria-label="Remove from favorites"
        className="absolute top-2 right-2 flex h-7 w-7 items-center justify-center rounded-full bg-black/60 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive"
      >
        <Trash2 className="h-3.5 w-3.5" aria-hidden />
      </button>
    </div>
  );
}

// ─── Artist card ───────────────────────────────────────────────────────────────

function FavoriteArtistCard({ artistId }: { artistId: string }) {
  const { data: artist, isLoading } = useArtist(artistId);
  const { toggle } = useIsFavoriteArtist(artistId);

  if (isLoading) return <CardSkeleton round />;
  if (!artist) return null;

  return (
    <div className="group relative space-y-3 text-center">
      <Link href={`/artist/${artist.id}`} className="block">
        <div className="relative aspect-square overflow-hidden rounded-full bg-secondary mx-auto">
          <div className="h-full w-full flex items-center justify-center">
            <span className="text-3xl font-bold text-muted-foreground/30">
              {artist.stageName[0]}
            </span>
          </div>
          <div className="absolute inset-0 rounded-full ring-2 ring-transparent group-hover:ring-primary/40 transition-all duration-200" />
        </div>
        <div className="px-1 mt-2">
          <p className="truncate text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
            {artist.stageName}
          </p>
          <p className="truncate text-xs text-muted-foreground mt-0.5">
            {formatCount(artist.monthlyListeners)} listeners
          </p>
        </div>
      </Link>

      {/* Remove button */}
      <button
        type="button"
        onClick={toggle}
        aria-label="Remove from favorites"
        className="absolute top-2 right-2 flex h-7 w-7 items-center justify-center rounded-full bg-black/60 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive"
      >
        <Trash2 className="h-3.5 w-3.5" aria-hidden />
      </button>
    </div>
  );
}

// ─── FavoritesClient ────────────────────────────────────────────────────────────

export function FavoritesClient() {
  const [tab, setTab] = useState<FavTab>('tracks');

  const { data: trackData, isLoading: tracksLoading } = useFavoriteTracks({ limit: 100 });
  const albumIds  = useFavoriteAlbumIds();
  const artistIds = useFavoriteArtistIds();

  const tracks     = trackData?.items ?? [];
  const albumArr   = useMemo(() => [...albumIds],  [albumIds]);
  const artistArr  = useMemo(() => [...artistIds], [artistIds]);

  return (
    <div className="px-4 py-8 lg:px-8 max-w-[1200px]">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/15 border border-primary/20">
          <Heart className="h-6 w-6 text-primary" aria-hidden />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Favorites</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {tracks.length} tracks · {albumArr.length} albums · {artistArr.length} artists
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border mb-6" role="tablist">
        {TABS.map(t => {
          const count = t.id === 'tracks' ? tracks.length : t.id === 'albums' ? albumArr.length : artistArr.length;
          const Icon  = t.icon;
          return (
            <button
              key={t.id}
              type="button"
              role="tab"
              aria-selected={tab === t.id}
              onClick={() => setTab(t.id)}
              className={cn(
                'flex items-center gap-2 px-5 py-3 text-sm font-medium border-b-2 -mb-px transition-colors',
                tab === t.id
                  ? 'border-primary text-foreground'
                  : 'border-transparent text-muted-foreground hover:text-foreground',
              )}
            >
              <Icon className="h-4 w-4 shrink-0" aria-hidden />
              {t.label}
              {count > 0 && (
                <span className={cn(
                  'ml-1 rounded-full px-1.5 py-px text-[10px] font-semibold',
                  tab === t.id
                    ? 'bg-primary/20 text-primary'
                    : 'bg-secondary text-muted-foreground',
                )}>
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ── Tracks tab ── */}
      {tab === 'tracks' && (
        <div role="tabpanel">
          {tracksLoading ? (
            Array.from({ length: 8 }).map((_, i) => <TrackSkeleton key={i} />)
          ) : tracks.length === 0 ? (
            <EmptyFavorites type="tracks" />
          ) : (
            <>
              {/* Column header */}
              <div className="flex items-center gap-3 px-3 pb-2 border-b border-border/50 text-[11px] font-medium uppercase tracking-widest text-muted-foreground/60 select-none">
                <span className="w-5 text-right">#</span>
                <span className="w-10" />
                <span className="flex-1">Title</span>
                <span className="hidden sm:block w-10 text-right">
                  <Clock className="h-3 w-3 ml-auto" />
                </span>
                <span className="w-7" />
              </div>
              <div className="mt-1 space-y-0.5">
                {tracks.map((track, i) => (
                  <FavoriteTrackRow key={track.id} track={track} index={i} queue={tracks} />
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {/* ── Albums tab ── */}
      {tab === 'albums' && (
        <div role="tabpanel">
          {albumArr.length === 0 ? (
            <EmptyFavorites type="albums" />
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {albumArr.map(id => <FavoriteAlbumCard key={id} albumId={id} />)}
            </div>
          )}
        </div>
      )}

      {/* ── Artists tab ── */}
      {tab === 'artists' && (
        <div role="tabpanel">
          {artistArr.length === 0 ? (
            <EmptyFavorites type="artists" />
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 gap-4">
              {artistArr.map(id => <FavoriteArtistCard key={id} artistId={id} />)}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
