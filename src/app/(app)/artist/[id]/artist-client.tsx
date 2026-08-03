'use client';

import { Play, BadgeCheck } from 'lucide-react';
import { useArtist } from '@/hooks/use-artists';
import { useTracks } from '@/hooks/use-tracks';
import { useArtistAlbums } from '@/hooks/use-albums';
import { usePlayerStore } from '@/stores/player.store';
import { TrackRow } from '@/components/track/track-card';
import { AlbumCard } from '@/components/album/album-card';
import { SectionHeader } from '@/components/shared/section-header';
import { DetailHeroSkeleton, CardSkeleton, TrackRowSkeleton } from '@/components/shared/skeleton';
import { EmptyState } from '@/components/shared/empty-state';
import { formatCount } from '@/lib/utils/index';
import { Music2 } from 'lucide-react';

export function ArtistClient({ id }: { id: string }) {
  const { data: artist, isLoading: artistLoading } = useArtist(id);
  const { data: tracks,  isLoading: tracksLoading  } = useTracks({ artistId: id, limit: 10, status: 'PUBLISHED' });
  const { data: albums,  isLoading: albumsLoading  } = useArtistAlbums(id, { limit: 12 });
  const { play } = usePlayerStore();

  const handlePlayAll = () => {
    if (tracks?.items.length) play(tracks.items[0], tracks.items);
  };

  if (artistLoading) return <DetailHeroSkeleton />;
  if (!artist) return <EmptyState icon={Music2} title="Artist not found" />;

  return (
    <div className="pb-12">
      {/* Hero */}
      <div className="relative h-64 md:h-80 bg-gradient-to-b from-primary/20 via-secondary/60 to-background overflow-hidden">
        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
        <div className="absolute bottom-0 left-0 p-6 lg:p-8 flex items-end gap-6">
          {/* Avatar */}
          <div className="h-28 w-28 md:h-36 md:w-36 rounded-full border-4 border-background bg-secondary flex items-center justify-center shrink-0 overflow-hidden shadow-2xl">
            <span className="text-4xl font-bold text-muted-foreground/30">
              {artist.stageName[0]}
            </span>
          </div>
          {/* Info */}
          <div className="min-w-0 pb-2">
            <div className="flex items-center gap-2 mb-1">
              {artist.isVerified && (
                <BadgeCheck className="h-5 w-5 text-primary" aria-label="Verified artist" />
              )}
              <span className="text-xs font-medium uppercase tracking-widest text-muted-foreground">Artist</span>
            </div>
            <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight truncate">
              {artist.stageName}
            </h1>
            <p className="mt-1.5 text-sm text-muted-foreground">
              {formatCount(artist.monthlyListeners)} monthly listeners
            </p>
          </div>
        </div>
      </div>

      {/* Action bar */}
      <div className="flex items-center gap-4 px-6 lg:px-8 py-5 border-b border-border">
        <button
          type="button"
          onClick={handlePlayAll}
          disabled={!tracks?.items.length}
          className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground hover:scale-105 active:scale-95 transition-transform disabled:opacity-40"
          aria-label="Play all tracks"
        >
          <Play className="h-5 w-5 fill-current translate-x-px" />
        </button>
      </div>

      <div className="px-6 lg:px-8 space-y-10 mt-6">
        {/* Popular Tracks */}
        <section aria-label="Popular tracks">
          <SectionHeader title="Popular" />
          {tracksLoading
            ? Array.from({ length: 5 }).map((_, i) => <TrackRowSkeleton key={i} />)
            : tracks?.items.length
              ? tracks.items.map((t, i) => (
                  <TrackRow key={t.id} track={t} index={i} queue={tracks.items} showArtist={false} />
                ))
              : <EmptyState icon={Music2} title="No tracks yet" />}
        </section>

        {/* Discography */}
        <section aria-label="Discography">
          <SectionHeader title="Discography" />
          {albumsLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {Array.from({ length: 5 }).map((_, i) => <CardSkeleton key={i} />)}
            </div>
          ) : albums?.items.length ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {albums.items.map((album) => (
                <AlbumCard key={album.id} album={album} />
              ))}
            </div>
          ) : (
            <EmptyState icon={Music2} title="No albums yet" />
          )}
        </section>

        {/* Bio */}
        {artist.bio && (
          <section aria-label="About">
            <SectionHeader title="About" />
            <p className="text-sm text-muted-foreground leading-relaxed max-w-2xl">
              {artist.bio}
            </p>
          </section>
        )}
      </div>
    </div>
  );
}