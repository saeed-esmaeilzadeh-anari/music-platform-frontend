'use client';

import { useState, useMemo } from 'react';
import { Clock, Music2, ListMusic } from 'lucide-react';

import { usePlaylist } from '@/hooks/use-playlists';
import { useAuthStore } from '@/stores/auth.store';

import { PlaylistHeader }        from '@/components/playlist/playlist-header';
import { PlaylistActionsBar }    from '@/components/playlist/playlist-actions-bar';
import { PlaylistTrackRow }      from '@/components/playlist/playlist-track-row';
import { PlaylistEditModal }     from '@/components/playlist/playlist-edit-modal';
import { PlaylistAddTracksModal }from '@/components/playlist/playlist-add-tracks-modal';
import { DetailHeroSkeleton, TrackRowSkeleton } from '@/components/shared/skeleton';
import { EmptyState } from '@/components/shared/empty-state';
import { Button } from '@/components/ui/button';

import type { TrackResponse } from '@/types';

interface PlaylistClientProps {
  id: string;
}

// ─── Column header ────────────────────────────────────────────────────────────

function TrackListHeader({ showAddedDate }: { showAddedDate: boolean }) {
  return (
    <div className="flex items-center gap-3 px-3 pb-2 border-b border-border/50 text-[11px] font-medium uppercase tracking-widest text-muted-foreground/60 select-none">
      {/* Index */}
      <span className="w-8 text-right">#</span>
      {/* Cover placeholder */}
      <span className="w-9" />
      {/* Title */}
      <span className="flex-1">Title</span>
      {/* Added date (hidden on mobile) */}
      {showAddedDate && (
        <span className="hidden lg:block w-24 text-right">Added</span>
      )}
      {/* Duration */}
      <span className="w-10 text-right">
        <Clock className="h-3 w-3 ml-auto" aria-label="Duration" />
      </span>
      {/* Actions gutter */}
      <span className="w-[88px]" />
    </div>
  );
}

// ─── PlaylistClient ───────────────────────────────────────────────────────────

export function PlaylistClient({ id }: PlaylistClientProps) {
  const { data: playlist, isLoading, error } = usePlaylist(id);
  const { user }                             = useAuthStore();

  const [editModalOpen, setEditModalOpen]         = useState(false);
  const [addTracksModalOpen, setAddTracksModalOpen] = useState(false);

  // ── Derived state ──────────────────────────────────────────────────────────

  const isOwner = !!user && !!playlist && user.id === playlist.ownerId;

  /**
   * The backend returns PlaylistTrack join rows (with .track) nested under
   * the playlist when fetching GET /playlists/:id.
   * We extract and type-assert them here — keeping this logic in one place.
   */
  const playlistTracks: Array<{ track: TrackResponse; addedAt: string }> =
    useMemo(() => {
      if (!playlist) return [];
      const raw = (playlist as any).tracks ?? [];
      return raw
        .filter((pt: any) => !!pt?.track)
        .map((pt: any) => ({ track: pt.track as TrackResponse, addedAt: pt.addedAt ?? '' }));
    }, [playlist]);

  const tracks       = useMemo(() => playlistTracks.map((pt) => pt.track), [playlistTracks]);
  const totalDuration = useMemo(() => tracks.reduce((s, t) => s + t.durationSec, 0), [tracks]);
  const existingTrackIds = useMemo(() => new Set(tracks.map((t) => t.id)), [tracks]);

  // ── Loading / error states ─────────────────────────────────────────────────

  if (isLoading) {
    return (
      <div>
        <DetailHeroSkeleton />
        <div className="px-6 lg:px-8 mt-4 space-y-1">
          {Array.from({ length: 8 }).map((_, i) => (
            <TrackRowSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  if (error || !playlist) {
    return (
      <EmptyState
        icon={ListMusic}
        title="Playlist not found"
        description="This playlist may have been deleted or set to private."
        className="min-h-[60vh]"
      />
    );
  }

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="pb-16">
      {/* ── Hero / header ── */}
      <PlaylistHeader
        playlist={playlist}
        trackCount={tracks.length}
        totalDurationSec={totalDuration}
        isOwner={isOwner}
        onEditClick={() => setEditModalOpen(true)}
      />

      {/* ── Action bar ── */}
      <PlaylistActionsBar
        playlist={playlist}
        tracks={tracks}
        isOwner={isOwner}
        onEditClick={() => setEditModalOpen(true)}
        onAddTracksClick={() => setAddTracksModalOpen(true)}
      />

      {/* ── Track list ── */}
      <div className="px-3 lg:px-5 mt-4">
        {tracks.length > 0 ? (
          <>
            <TrackListHeader showAddedDate={playlistTracks.some((pt) => !!pt.addedAt)} />

            <div className="mt-1 space-y-0.5">
              {playlistTracks.map(({ track, addedAt }, i) => (
                <PlaylistTrackRow
                  key={`${track.id}-${i}`}
                  track={track}
                  index={i}
                  totalTracks={tracks.length}
                  queue={tracks}
                  playlistId={id}
                  isOwner={isOwner}
                  addedAt={addedAt}
                />
              ))}
            </div>
          </>
        ) : (
          <EmptyState
            icon={Music2}
            title="No tracks yet"
            description={
              isOwner
                ? 'Click "Add tracks" above to start building this playlist.'
                : 'This playlist has no tracks yet.'
            }
            className="py-20"
            action={
              isOwner ? (
                <Button
                  variant="secondary"
                  size="md"
                  onClick={() => setAddTracksModalOpen(true)}
                >
                  Add tracks
                </Button>
              ) : undefined
            }
          />
        )}
      </div>

      {/* ── Modals ── */}
      {editModalOpen && (
        <PlaylistEditModal
          playlist={playlist}
          onClose={() => setEditModalOpen(false)}
        />
      )}

      {addTracksModalOpen && (
        <PlaylistAddTracksModal
          playlistId={id}
          existingTrackIds={existingTrackIds}
          onClose={() => setAddTracksModalOpen(false)}
        />
      )}
    </div>
  );
}
