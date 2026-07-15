'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';
import { useMyPlaylists, useCreatePlaylist } from '@/hooks/use-playlists';
import { useFavorites } from '@/hooks/use-catalog';
import { PlaylistCard } from '@/components/playlist/playlist-card';
import { TrackRow } from '@/components/track/track-card';
import { CardSkeleton, TrackRowSkeleton } from '@/components/shared/skeleton';
import { EmptyState } from '@/components/shared/empty-state';
import { cn } from '@/lib/utils';
import { ListMusic, Heart } from 'lucide-react';
import type { TrackResponse } from '@/types';

type LibraryTab = 'playlists' | 'favorites';

// ─── Create playlist button ───────────────────────────────────────────────────

function CreatePlaylistButton() {
  const createPlaylist = useCreatePlaylist();
  const [creating, setCreating] = useState(false);
  const [title, setTitle] = useState('');

  if (!creating) {
    return (
      <button
        type="button"
        onClick={() => setCreating(true)}
        className="flex items-center gap-2 rounded-md border border-dashed border-border px-4 py-2.5 text-sm text-muted-foreground hover:border-primary/40 hover:text-foreground transition-colors"
      >
        <Plus className="h-4 w-4" />
        New playlist
      </button>
    );
  }

  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        if (!title.trim()) return;
        await createPlaylist.mutateAsync({ title: title.trim(), visibility: 'PRIVATE' });
        setTitle('');
        setCreating(false);
      }}
      className="flex items-center gap-2"
    >
      <input
        autoFocus
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Playlist name"
        className="rounded-md bg-secondary border border-border px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/50 outline-none focus:border-primary/50 focus:ring-2 focus:ring-ring/20"
      />
      <button type="submit" disabled={!title.trim() || createPlaylist.isPending}
        className="rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50">
        Create
      </button>
      <button type="button" onClick={() => setCreating(false)}
        className="rounded-md border border-border px-3 py-2 text-sm text-muted-foreground hover:text-foreground">
        Cancel
      </button>
    </form>
  );
}

// ─── Tabs ────────────────────────────────────────────────────────────────────

function TabButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'px-4 py-2 text-sm font-medium border-b-2 transition-colors -mb-px',
        active
          ? 'border-primary text-foreground'
          : 'border-transparent text-muted-foreground hover:text-foreground',
      )}
    >
      {children}
    </button>
  );
}

// ─── LibraryClient ────────────────────────────────────────────────────────────

export function LibraryClient() {
  const [tab, setTab] = useState<LibraryTab>('playlists');
  const { data: playlists, isLoading: plLoading } = useMyPlaylists({ limit: 50 });
  const { data: favorites, isLoading: favLoading } = useFavorites({ limit: 50 });

  // Build tracks array for queue from favorites
  const favTracks: TrackResponse[] = (favorites?.items ?? []).map((f: any) => f.track).filter(Boolean);

  return (
    <div className="px-4 py-6 lg:px-8 max-w-[1400px]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Your Library</h1>
        {tab === 'playlists' && <CreatePlaylistButton />}
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border mb-6">
        <TabButton active={tab === 'playlists'} onClick={() => setTab('playlists')}>
          <span className="flex items-center gap-2"><ListMusic className="h-4 w-4" />Playlists</span>
        </TabButton>
        <TabButton active={tab === 'favorites'} onClick={() => setTab('favorites')}>
          <span className="flex items-center gap-2"><Heart className="h-4 w-4" />Favorites</span>
        </TabButton>
      </div>

      {/* Playlists tab */}
      {tab === 'playlists' && (
        <>
          {plLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {Array.from({ length: 12 }).map((_, i) => <CardSkeleton key={i} />)}
            </div>
          ) : playlists?.items.length ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {playlists.items.map((pl) => <PlaylistCard key={pl.id} playlist={pl} />)}
            </div>
          ) : (
            <EmptyState
              icon={ListMusic}
              title="No playlists yet"
              description="Create your first playlist above."
            />
          )}
        </>
      )}

      {/* Favorites tab */}
      {tab === 'favorites' && (
        <>
          {favLoading ? (
            Array.from({ length: 8 }).map((_, i) => <TrackRowSkeleton key={i} />)
          ) : favTracks.length ? (
            <div>
              {favTracks.map((track) => (
                <TrackRow key={track.id} track={track} queue={favTracks} />
              ))}
            </div>
          ) : (
            <EmptyState
              icon={Heart}
              title="No favorites yet"
              description="Like tracks to add them here."
            />
          )}
        </>
      )}
    </div>
  );
}