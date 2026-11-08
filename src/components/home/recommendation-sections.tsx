'use client';

import { useMemo } from 'react';
import { useRecommendations } from '@/hooks/use-recommendations';
import { useLocale } from '@/providers/locale-provider';
import { TrackCard } from '@/components/track/track-card';
import { AlbumCard } from '@/components/album/album-card';
import { ArtistCard } from '@/components/artist/artist-card';
import { PlaylistCard } from '@/components/playlist/playlist-card';
import { SectionHeader } from '@/components/shared/section-header';
import { CardSkeleton, ArtistCardSkeleton } from '@/components/shared/skeleton';
import type {
  PlayableTrackItem,
  PlayableAlbumItem,
  PlayableArtistItem,
  PlayablePlaylistItem,
  RecommendationSection,
  TrackResponse,
} from '@/types';

/** Stable section id -> i18n key (fa/en). */
const SECTION_TITLE_KEYS: Record<RecommendationSection['id'], string> = {
  'recently-played': 'recommendations.recentlyPlayed',
  'new-releases': 'recommendations.newReleases',
  trending: 'recommendations.trending',
  'artists-for-you': 'recommendations.artistsForYou',
  'made-for-you': 'recommendations.madeForYou',
  'because-you-follow': 'recommendations.becauseYouFollow',
};

/** Map the API "playable" card shape onto the shared card components. */
function PlayableItems({ section }: { section: RecommendationSection }) {
  const trackQueue: TrackResponse[] = useMemo(
    () =>
      section.type === 'track'
        ? (section.items as PlayableTrackItem[]).map(t => ({
            id: t.id,
            title: t.title,
            durationSec: t.durationSec,
            status: 'PUBLISHED' as const,
            isExplicit: t.isExplicit,
            playCount: '0',
            albumId: t.albumId,
            coverUrl: t.coverUrl,
            audioUrl: t.audioUrl,
            createdAt: '',
            artist: { id: t.artistId, stageName: t.artistName },
          }))
        : [],
    [section],
  );

  if (section.type === 'track') {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        {trackQueue.map(track => (
          <TrackCard key={track.id} track={track} queue={trackQueue} />
        ))}
      </div>
    );
  }

  if (section.type === 'artist') {
    return (
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 gap-4">
        {(section.items as PlayableArtistItem[]).map(a => (
          <ArtistCard
            key={a.id}
            artist={{
              id: a.id,
              userId: '',
              stageName: a.stageName,
              bio: null,
              bannerUrl: a.imageUrl,
              isVerified: a.isVerified,
              monthlyListeners: a.monthlyListeners,
              createdAt: '',
            }}
          />
        ))}
      </div>
    );
  }

  if (section.type === 'playlist') {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {(section.items as PlayablePlaylistItem[]).map(p => (
          <PlaylistCard
            key={p.id}
            playlist={{
              id: p.id,
              title: p.title,
              description: null,
              coverUrl: p.coverUrl,
              visibility: 'PUBLIC' as const,
              ownerId: '',
              createdAt: '',
            }}
          />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
      {(section.items as PlayableAlbumItem[]).map(al => (
        <AlbumCard
          key={al.id}
          album={{
            id: al.id,
            title: al.title,
            type: 'ALBUM' as const,
            coverUrl: al.coverUrl,
            releaseDate: null,
            artistId: al.artistId,
            isPublished: true,
            createdAt: '',
          }}
          artistName={al.artistName}
        />
      ))}
    </div>
  );
}

function SectionSkeleton({ type }: { type: RecommendationSection['type'] }) {
  if (type === 'artist') {
    return (
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <ArtistCardSkeleton key={i} />
        ))}
      </div>
    );
  }
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
  );
}

/**
 * Six personalized home-feed sections rendered from GET /recommendations.
 * Renders nothing when the API is unavailable - the static home sections
 * still render below.
 */
export function RecommendationSections({ limit = 8 }: { limit?: number }) {
  const { t } = useLocale();
  const { data, isLoading } = useRecommendations(limit);

  if (isLoading) {
    return (
      <div className="space-y-10">
        <SectionSkeleton type="track" />
        <SectionSkeleton type="artist" />
      </div>
    );
  }

  if (!data?.sections?.length) return null;

  return (
    <div className="space-y-10" data-cold-start={data.coldStart}>
      {data.sections.map(
        section =>
          section.items.length > 0 && (
            <section
              key={section.id}
              aria-label={SECTION_TITLE_KEYS[section.id]}
            >
              <SectionHeader title={t(SECTION_TITLE_KEYS[section.id] as never)} />
              <PlayableItems section={section} />
            </section>
          ),
      )}
    </div>
  );
}
