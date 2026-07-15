'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Search, X } from 'lucide-react';
import { useSearch } from '@/hooks/use-catalog';
import { useGenres } from '@/hooks/use-catalog';
import { usePlayerStore } from '@/stores/player.store';
import { TrackRow } from '@/components/track/track-card';
import { AlbumCard } from '@/components/album/album-card';
import { ArtistCard } from '@/components/artist/artist-card';
import { PlaylistCard } from '@/components/playlist/playlist-card';
import { CardSkeleton, ArtistCardSkeleton, TrackRowSkeleton } from '@/components/shared/skeleton';
import { EmptyState } from '@/components/shared/empty-state';
import { cn } from '@/lib/utils';
import { ROUTES } from '@/lib/constants';
import Link from 'next/link';
import type { SearchEntityType, TrackResponse } from '@/types';

const TABS: { label: string; value: SearchEntityType }[] = [
  { label: 'All',      value: 'ALL' },
  { label: 'Tracks',   value: 'TRACK' },
  { label: 'Albums',   value: 'ALBUM' },
  { label: 'Artists',  value: 'ARTIST' },
  { label: 'Playlists',value: 'PLAYLIST' },
];

function useDebounce<T>(value: T, delay = 350): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

export function SearchClient() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialQ    = searchParams.get('q') ?? '';
  const initialType = (searchParams.get('type') as SearchEntityType) ?? 'ALL';

  const [query, setQuery] = useState(initialQ);
  const [activeTab, setActiveTab] = useState<SearchEntityType>(initialType);
  const debouncedQ = useDebounce(query);
  const { data: genres } = useGenres();
  const { play } = usePlayerStore();
  const inputRef = useRef<HTMLInputElement>(null);

  // Sync URL
  useEffect(() => {
    if (!debouncedQ) return;
    const params = new URLSearchParams();
    params.set('q', debouncedQ);
    if (activeTab !== 'ALL') params.set('type', activeTab);
    router.replace(`${ROUTES.SEARCH}?${params.toString()}`, { scroll: false });
  }, [debouncedQ, activeTab, router]);

  const { data: results, isLoading } = useSearch({
    q: debouncedQ || ' ',
    type: activeTab,
    limit: 20,
  });

  const clearQuery = () => {
    setQuery('');
    inputRef.current?.focus();
  };

  const trackItems: TrackResponse[] = (results?.tracks ?? []).map(t => ({
    id: t.id, title: t.title, durationSec: 0, status: 'PUBLISHED',
    isExplicit: false, playCount: '0', albumId: null, coverUrl: null, audioUrl: null,
    createdAt: '', artist: { id: '', stageName: t.artistName },
  }));

  return (
    <div className="px-4 py-6 lg:px-8 max-w-[1400px]">
      {/* Search bar */}
      <div className="relative max-w-xl mb-8">
        <Search className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" aria-hidden />
        <input
          ref={inputRef}
          type="search"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Search artists, albums, tracks, playlists…"
          aria-label="Search"
          autoFocus
          className="w-full rounded-full bg-secondary border border-border pl-12 pr-12 py-3 text-sm text-foreground placeholder:text-muted-foreground/50 outline-none focus:border-primary/50 focus:ring-2 focus:ring-ring/20 transition-all"
        />
        {query && (
          <button type="button" onClick={clearQuery} aria-label="Clear"
            className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* No query — show genre browse */}
      {!debouncedQ.trim() && (
        <div>
          <h2 className="text-xl font-bold mb-4">Browse by genre</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {genres?.map((genre, i) => {
              const colors = ['from-violet-600','from-emerald-600','from-blue-600','from-rose-600','from-amber-600','from-cyan-600'];
              return (
                <Link key={genre.id}
                  href={`${ROUTES.SEARCH}?q=${encodeURIComponent(genre.slug)}&type=TRACK`}
                  className={cn('relative overflow-hidden rounded-md aspect-[4/3] bg-gradient-to-br to-black/60 p-4 flex items-end cursor-pointer hover:scale-[1.02] transition-transform', colors[i % colors.length])}>
                  <span className="font-bold text-white text-sm drop-shadow">{genre.name}</span>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* Results */}
      {debouncedQ.trim() && (
        <>
          {/* Tabs */}
          <div className="flex gap-1 mb-6 border-b border-border">
            {TABS.map(tab => (
              <button key={tab.value} type="button"
                onClick={() => setActiveTab(tab.value)}
                className={cn(
                  'px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px',
                  activeTab === tab.value
                    ? 'border-primary text-foreground'
                    : 'border-transparent text-muted-foreground hover:text-foreground',
                )}>
                {tab.label}
              </button>
            ))}
          </div>

          {isLoading ? (
            <ResultsSkeleton type={activeTab} />
          ) : (
            <ResultsGrid results={results} type={activeTab} trackItems={trackItems} onPlay={(t, q) => play(t, q)} />
          )}
        </>
      )}
    </div>
  );
}

function ResultsSkeleton({ type }: { type: SearchEntityType }) {
  if (type === 'ARTIST') return <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-4">{Array.from({length:6}).map((_,i)=><ArtistCardSkeleton key={i}/>)}</div>;
  if (type === 'TRACK')  return <div>{Array.from({length:8}).map((_,i)=><TrackRowSkeleton key={i}/>)}</div>;
  return <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">{Array.from({length:10}).map((_,i)=><CardSkeleton key={i}/>)}</div>;
}

function ResultsGrid({ results, type, trackItems, onPlay }: {
  results: ReturnType<typeof useSearch>['data'];
  type: SearchEntityType;
  trackItems: TrackResponse[];
  onPlay: (t: TrackResponse, q: TrackResponse[]) => void;
}) {
  const hasResults =
    (results?.tracks?.length ?? 0) + (results?.albums?.length ?? 0) +
    (results?.artists?.length ?? 0) + (results?.playlists?.length ?? 0) > 0;

  if (!hasResults) return <EmptyState title="No results found" description="Try a different search term." />;

  return (
    <div className="space-y-10">
      {(type === 'ALL' || type === 'TRACK') && results?.tracks?.length ? (
        <section>
          {type === 'ALL' && <h3 className="text-lg font-bold mb-3">Tracks</h3>}
          <div>{trackItems.map((t) => <TrackRow key={t.id} track={t} queue={trackItems} />)}</div>
        </section>
      ) : null}

      {(type === 'ALL' || type === 'ALBUM') && results?.albums?.length ? (
        <section>
          {type === 'ALL' && <h3 className="text-lg font-bold mb-4">Albums</h3>}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {results.albums.map(a => (
              <AlbumCard key={a.id} album={{ id: a.id, title: a.title, type: 'ALBUM', coverUrl: null, releaseDate: null, artistId: '', isPublished: true, createdAt: '' }} artistName={a.artistName} />
            ))}
          </div>
        </section>
      ) : null}

      {(type === 'ALL' || type === 'ARTIST') && results?.artists?.length ? (
        <section>
          {type === 'ALL' && <h3 className="text-lg font-bold mb-4">Artists</h3>}
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 gap-4">
            {results.artists.map(a => (
              <ArtistCard key={a.id} artist={{ id: a.id, userId: '', stageName: a.stageName, bio: null, bannerUrl: null, isVerified: false, monthlyListeners: 0, createdAt: '' }} />
            ))}
          </div>
        </section>
      ) : null}

      {(type === 'ALL' || type === 'PLAYLIST') && results?.playlists?.length ? (
        <section>
          {type === 'ALL' && <h3 className="text-lg font-bold mb-4">Playlists</h3>}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {results.playlists.map(p => (
              <PlaylistCard key={p.id} playlist={{ id: p.id, title: p.title, description: null, coverUrl: null, visibility: 'PUBLIC', ownerId: '', createdAt: '' }} />
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}