'use client';

import { useAuthStore } from '@/stores/auth.store';
import { useTracks } from '@/hooks/use-tracks';
import { useAlbums } from '@/hooks/use-albums';
import { useArtists } from '@/hooks/use-artists';
import { useMyPlaylists } from '@/hooks/use-playlists';
import { SectionHeader } from '@/components/shared/section-header';
import { TrackCard } from '@/components/track/track-card';
import { AlbumCard } from '@/components/album/album-card';
import { ArtistCard } from '@/components/artist/artist-card';
import { PlaylistCard } from '@/components/playlist/playlist-card';
import { CardSkeleton, ArtistCardSkeleton } from '@/components/shared/skeleton';
import { ROUTES } from '@/lib/constants';

function Greeting() {
  const { user } = useAuthStore();
  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  return (
    <div className="mb-8">
      <h1 className="text-3xl font-bold tracking-tight">
        {greeting}{user?.username ? `, ${user.username}` : ''}
      </h1>
    </div>
  );
}

function CardGrid({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
      {children}
    </div>
  );
}

export function HomeClient() {
  const { data: tracks,   isLoading: tracksLoading  } = useTracks({ limit: 6, status: 'PUBLISHED' });
  const { data: albums,   isLoading: albumsLoading  } = useAlbums({ limit: 6 });
  const { data: artists,  isLoading: artistsLoading } = useArtists({ limit: 6 });
  const { data: playlists, isLoading: playlistsLoading } = useMyPlaylists({ limit: 6 });

  return (
    <div className="px-4 py-6 lg:px-8 lg:py-8 space-y-10 max-w-[1600px]">
      <Greeting />

      {/* Trending Tracks */}
      <section aria-label="Trending tracks">
        <SectionHeader title="Trending" seeAllHref={ROUTES.SEARCH + '?type=TRACK'} />
        <CardGrid>
          {tracksLoading
            ? Array.from({ length: 6 }).map((_, i) => <CardSkeleton key={i} />)
            : tracks?.items.map((track) => (
                <TrackCard key={track.id} track={track} queue={tracks.items} />
              ))}
        </CardGrid>
      </section>

      {/* New Albums */}
      <section aria-label="New albums">
        <SectionHeader title="New Releases" seeAllHref={ROUTES.SEARCH + '?type=ALBUM'} />
        <CardGrid>
          {albumsLoading
            ? Array.from({ length: 6 }).map((_, i) => <CardSkeleton key={i} />)
            : albums?.items.map((album) => <AlbumCard key={album.id} album={album} />)}
        </CardGrid>
      </section>

      {/* Popular Artists */}
      <section aria-label="Popular artists">
        <SectionHeader title="Popular Artists" seeAllHref={ROUTES.SEARCH + '?type=ARTIST'} />
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 gap-4">
          {artistsLoading
            ? Array.from({ length: 6 }).map((_, i) => <ArtistCardSkeleton key={i} />)
            : artists?.items.map((artist) => <ArtistCard key={artist.id} artist={artist} />)}
        </div>
      </section>

      {/* My Playlists */}
      {(playlists?.items?.length ?? 0) > 0 && (
        <section aria-label="Your playlists">
          <SectionHeader title="Your Playlists" seeAllHref={ROUTES.LIBRARY} />
          <CardGrid>
            {playlistsLoading
              ? Array.from({ length: 4 }).map((_, i) => <CardSkeleton key={i} />)
              : playlists?.items.map((pl) => <PlaylistCard key={pl.id} playlist={pl} />)}
          </CardGrid>
        </section>
      )}
    </div>
  );
}