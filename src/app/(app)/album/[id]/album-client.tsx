'use client';

import Link from 'next/link';
import { Play, Clock } from 'lucide-react';
import { useAlbum } from '@/hooks/use-albums';
import { useTracks } from '@/hooks/use-tracks';
import { usePlayerStore } from '@/stores/player.store';
import { TrackRow } from '@/components/track/track-card';
import { CoverImage } from '@/components/shared/cover-image';
import { LikeButton } from '@/components/shared/like-button';
import { DetailHeroSkeleton, TrackRowSkeleton } from '@/components/shared/skeleton';
import { EmptyState } from '@/components/shared/empty-state';
import { ROUTES } from '@/lib/constants';
import { formatDate, formatDuration } from '@/lib/utils';
import { Music2, Disc3 } from 'lucide-react';

export function AlbumClient({ id }: { id: string }) {
  const { data: album, isLoading: albumLoading } = useAlbum(id);
  const { data: tracks, isLoading: tracksLoading } = useTracks({ albumId: id, limit: 50, status: 'PUBLISHED' });
  const { play } = usePlayerStore();

  const handlePlayAll = () => {
    if (tracks?.items.length) play(tracks.items[0], tracks.items);
  };

  const totalDuration = tracks?.items.reduce((sum, t) => sum + t.durationSec, 0) ?? 0;

  if (albumLoading) return <DetailHeroSkeleton />;
  if (!album) return <EmptyState icon={Disc3} title="Album not found" />;

  return (
    <div className="pb-12">
      {/* Hero */}
      <div className="bg-gradient-to-b from-primary/15 via-secondary/50 to-background px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-end gap-6 max-w-4xl">
          <div className="h-44 w-44 shrink-0 rounded-md shadow-2xl overflow-hidden">
            <CoverImage src={album.coverUrl} alt={album.title} type="album" size="xl" />
          </div>
          <div className="min-w-0 pb-1">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2">{album.type}</p>
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-3 leading-tight">
              {album.title}
            </h1>
            <div className="flex items-center flex-wrap gap-1.5 text-sm text-muted-foreground">
              <Link href={ROUTES.ARTIST(album.artistId)} className="font-medium text-foreground hover:underline">
                Artist
              </Link>
              {album.releaseDate && (
                <><span aria-hidden>·</span><span>{formatDate(album.releaseDate, { year: 'numeric' })}</span></>
              )}
              {tracks?.items.length ? (
                <><span aria-hidden>·</span><span>{tracks.items.length} tracks</span></>
              ) : null}
              {totalDuration > 0 && (
                <><span aria-hidden>·</span><span>{formatDuration(totalDuration)}</span></>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-4 px-6 lg:px-8 py-5 border-b border-border">
        <button
          type="button"
          onClick={handlePlayAll}
          disabled={!tracks?.items.length}
          className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground hover:scale-105 active:scale-95 transition-transform disabled:opacity-40"
          aria-label="Play album"
        >
          <Play className="h-5 w-5 fill-current translate-x-px" />
        </button>
        <LikeButton targetType="ALBUM" targetId={id} size="md" />
      </div>

      {/* Track list */}
      <div className="px-3 lg:px-5 mt-4">
        {/* Header row */}
        <div className="flex items-center gap-3 px-3 pb-2 border-b border-border/50 text-[11px] uppercase tracking-widest text-muted-foreground/60 font-medium">
          <span className="w-8 text-right">#</span>
          <span className="flex-1">Title</span>
          <span className="hidden md:block w-14 text-right">Plays</span>
          <span className="w-10 text-right"><Clock className="h-3 w-3 ml-auto" /></span>
          <span className="w-[72px]" />
        </div>

        {tracksLoading
          ? Array.from({ length: 8 }).map((_, i) => <TrackRowSkeleton key={i} />)
          : tracks?.items.length
            ? tracks.items.map((t, i) => (
                <TrackRow key={t.id} track={t} index={i} queue={tracks.items} showArtist={false} />
              ))
            : <EmptyState icon={Music2} title="No tracks yet" className="py-12" />}
      </div>
    </div>
  );
}