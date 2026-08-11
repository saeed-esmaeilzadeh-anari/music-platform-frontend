'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { ListMusic, Music2, Clock } from 'lucide-react';
import { usePlaylist, type PlaylistWithTracks } from '@/hooks/use-playlists';
import { useAuthStore } from '@/stores/auth.store';
import { PlaylistHeader }         from '@/components/playlist/playlist-header';
import { PlaylistActionsBar }     from '@/components/playlist/playlist-actions-bar';
import { PlaylistTrackRow }       from '@/components/playlist/playlist-track-row';
import { PlaylistEditModal }      from '@/components/playlist/playlist-edit-modal';
import { PlaylistAddTracksModal } from '@/components/playlist/playlist-add-tracks-modal';
import { cn } from '@/lib/utils';
import type { TrackResponse } from '@/types';

// ── Skeletons ────────────────────────────────────────────────────────────────

function HeroSkeleton() {
  return (
    <div className="bg-gradient-to-b from-primary/10 to-background px-6 lg:px-8 py-8">
      <div className="flex gap-6">
        <div className="h-44 w-44 shrink-0 rounded-md bg-secondary animate-pulse" />
        <div className="flex-1 space-y-3 pt-6">
          <div className="h-3 w-24 rounded bg-secondary animate-pulse" />
          <div className="h-8 w-56 rounded bg-secondary animate-pulse" />
          <div className="h-4 w-32 rounded bg-secondary animate-pulse" />
        </div>
      </div>
    </div>
  );
}

function RowSkeleton() {
  return (
    <div className="flex items-center gap-3 px-3 py-2.5">
      <div className="h-4 w-4 shrink-0 rounded bg-secondary animate-pulse" />
      <div className="h-9 w-9 shrink-0 rounded bg-secondary animate-pulse" />
      <div className="flex-1 space-y-1.5">
        <div className="h-3.5 w-40 rounded bg-secondary animate-pulse" />
        <div className="h-3 w-24 rounded bg-secondary animate-pulse" />
      </div>
      <div className="h-3 w-10 shrink-0 rounded bg-secondary animate-pulse" />
    </div>
  );
}

// ── Empty state ───────────────────────────────────────────────────────────────

function EmptyState({ isOwner, onAdd }: { isOwner: boolean; onAdd: () => void }) {
  return (
    <div className="flex flex-col items-center gap-4 py-20 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-secondary border border-border">
        <Music2 className="h-7 w-7 text-muted-foreground/40" aria-hidden />
      </div>
      <div>
        <p className="font-semibold text-foreground">No tracks yet</p>
        <p className="mt-1 text-sm text-muted-foreground">
          {isOwner ? 'Add tracks to get this playlist started.' : 'This playlist has no tracks yet.'}
        </p>
      </div>
      {isOwner && (
        <button type="button" onClick={onAdd}
          className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90 transition-opacity">
          Add tracks
        </button>
      )}
    </div>
  );
}

// ── PlaylistClient ────────────────────────────────────────────────────────────

interface PlaylistClientProps { id: string }

export function PlaylistClient({ id }: PlaylistClientProps) {
  const router                   = useRouter();
  const { data, isLoading, error } = usePlaylist(id);
  const playlist                 = data as PlaylistWithTracks | undefined;
  const { user }                 = useAuthStore();

  const [editOpen,      setEditOpen]      = useState(false);
  const [addTracksOpen, setAddTracksOpen] = useState(false);

  // Derive tracks from nested PlaylistTrack join rows
  const playlistTracks = useMemo(() => {
    if (!playlist?.tracks) return [];
    return playlist.tracks
      .filter((pt): pt is { track: TrackResponse; addedAt: string; position: number } => !!pt?.track)
      .sort((a, b) => a.position - b.position);
  }, [playlist]);

  const tracks         = useMemo(() => playlistTracks.map(pt => pt.track), [playlistTracks]);
  const totalDuration  = useMemo(() => tracks.reduce((s, t) => s + t.durationSec, 0), [tracks]);
  const existingIds    = useMemo(() => new Set(tracks.map(t => t.id)), [tracks]);
  const isOwner        = !!user && !!playlist && user.id === playlist.ownerId;

  // Simple play state (replace with your real player store when wiring up)
  const [currentTrackId, setCurrentTrackId] = useState<string | null>(null);
  const [isPlaying,      setIsPlaying]      = useState(false);
  const isPlaylistPlaying = isPlaying && tracks.some(t => t.id === currentTrackId);

  const handlePlayPause = () => {
    if (!tracks.length) return;
    if (isPlaylistPlaying) { setIsPlaying(false); return; }
    setCurrentTrackId(tracks[0].id);
    setIsPlaying(true);
  };

  const handleTrackPlay = (track: TrackResponse) => {
    if (currentTrackId === track.id) { setIsPlaying(v => !v); return; }
    setCurrentTrackId(track.id);
    setIsPlaying(true);
  };

  // Loading
  if (isLoading) return (
    <div>
      <HeroSkeleton />
      <div className="px-3 lg:px-5 mt-4 space-y-1">
        {Array.from({ length: 8 }).map((_, i) => <RowSkeleton key={i} />)}
      </div>
    </div>
  );

  // Not found / error
  if (error || !playlist) return (
    <div className="flex flex-col items-center gap-4 py-24 text-center px-4">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-secondary border border-border">
        <ListMusic className="h-7 w-7 text-muted-foreground/40" />
      </div>
      <div>
        <p className="font-semibold">Playlist not found</p>
        <p className="mt-1 text-sm text-muted-foreground">This playlist may have been deleted or set to private.</p>
      </div>
    </div>
  );

  return (
    <div className="pb-16">

      {/* Hero / header */}
      <PlaylistHeader
        playlist={playlist}
        trackCount={tracks.length}
        totalDurationSec={totalDuration}
        isOwner={isOwner}
        onEditClick={() => setEditOpen(true)}
      />

      {/* Action bar */}
      <PlaylistActionsBar
        playlist={playlist}
        tracks={tracks}
        isOwner={isOwner}
        isPlaylistPlaying={isPlaylistPlaying}
        onPlayPause={handlePlayPause}
        onEditClick={() => setEditOpen(true)}
        onAddTracksClick={() => setAddTracksOpen(true)}
        onDeleted={() => router.replace('/library')}
      />

      {/* Track list */}
      <div className="px-3 lg:px-5 mt-4">
        {tracks.length > 0 ? (
          <>
            {/* Column header */}
            <div className="flex items-center gap-3 px-3 pb-2 border-b border-border/50 text-[11px] font-medium uppercase tracking-widest text-muted-foreground/60 select-none">
              <span className="w-8 text-right">#</span>
              <span className="w-9" />
              <span className="flex-1">Title</span>
              <span className="hidden lg:block w-24 text-right">Added</span>
              <span className="w-10 text-right">
                <Clock className="h-3 w-3 ml-auto" aria-label="Duration" />
              </span>
              <span className="w-16" />
            </div>

            <div className="mt-1 space-y-0.5">
              {playlistTracks.map((pt, i) => (
                <PlaylistTrackRow
                  key={`${pt.track.id}-${i}`}
                  track={pt.track}
                  index={i}
                  totalTracks={tracks.length}
                  playlistId={id}
                  isOwner={isOwner}
                  addedAt={pt.addedAt}
                  isCurrent={currentTrackId === pt.track.id}
                  isPlaying={isPlaying && currentTrackId === pt.track.id}
                  onPlay={() => handleTrackPlay(pt.track)}
                  onAddToOther={() => {}}
                />
              ))}
            </div>
          </>
        ) : (
          <EmptyState isOwner={isOwner} onAdd={() => setAddTracksOpen(true)} />
        )}
      </div>

      {/* Modals */}
      {editOpen && (
        <PlaylistEditModal playlist={playlist} onClose={() => setEditOpen(false)} />
      )}
      {addTracksOpen && (
        <PlaylistAddTracksModal
          playlistId={id}
          existingTrackIds={existingIds}
          onClose={() => setAddTracksOpen(false)}
        />
      )}
    </div>
  );
}
