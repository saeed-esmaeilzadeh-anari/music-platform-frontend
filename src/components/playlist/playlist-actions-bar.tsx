'use client';

import { useState } from 'react';
import { Play, Pause, Pencil, Trash2, UserPlus } from 'lucide-react';
import { useDeletePlaylist } from '@/hooks/use-playlists';
import { PlaylistShareButton } from './playlist-share-button';
import { cn } from '@/lib/utils';
import type { PlaylistResponse, TrackResponse } from '@/types';

interface PlaylistActionsBarProps {
  playlist: PlaylistResponse;
  tracks: TrackResponse[];
  isOwner: boolean;
  isPlaylistPlaying: boolean;
  onPlayPause: () => void;
  onEditClick: () => void;
  onAddTracksClick: () => void;
  onDeleted: () => void;
}

export function PlaylistActionsBar({
  playlist, tracks, isOwner, isPlaylistPlaying,
  onPlayPause, onEditClick, onAddTracksClick, onDeleted,
}: PlaylistActionsBarProps) {
  const deleteMutation      = useDeletePlaylist();
  const [confirmDelete, setConfirmDelete] = useState(false);

  const handleDelete = async () => {
    await deleteMutation.mutateAsync(playlist.id);
    onDeleted();
  };

  return (
    <div className="flex items-center gap-3 flex-wrap px-6 lg:px-8 py-5 border-b border-border">

      {/* Play / Pause */}
      <button type="button" onClick={onPlayPause} disabled={!tracks.length}
        aria-label={isPlaylistPlaying ? 'Pause' : 'Play playlist'}
        className={cn(
          'flex h-12 w-12 items-center justify-center rounded-full shrink-0',
          'bg-primary text-primary-foreground shadow-md',
          'hover:scale-105 active:scale-95 transition-transform duration-100',
          'disabled:opacity-40 disabled:hover:scale-100 disabled:cursor-not-allowed',
        )}>
        {isPlaylistPlaying
          ? <Pause className="h-5 w-5 fill-current" aria-hidden />
          : <Play  className="h-5 w-5 fill-current translate-x-px" aria-hidden />}
      </button>

      {/* Share */}
      <PlaylistShareButton playlist={playlist} isOwner={isOwner} />

      {/* Owner actions */}
      {isOwner && (
        <>
          <button type="button" onClick={onAddTracksClick}
            aria-label="Add tracks"
            className="flex items-center gap-2 rounded-md border border-border px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:border-primary/40 transition-colors">
            <UserPlus className="h-4 w-4" aria-hidden />
            <span className="hidden sm:inline">Add tracks</span>
          </button>

          <button type="button" onClick={onEditClick}
            aria-label="Edit playlist"
            className="flex items-center gap-2 rounded-md border border-border px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:border-primary/40 transition-colors">
            <Pencil className="h-4 w-4" aria-hidden />
            <span className="hidden sm:inline">Edit</span>
          </button>

          {confirmDelete ? (
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Delete playlist?</span>
              <button type="button" onClick={handleDelete} disabled={deleteMutation.isPending}
                className="rounded-md bg-destructive px-3 py-1.5 text-xs font-medium text-destructive-foreground hover:opacity-90 disabled:opacity-50 transition-opacity">
                {deleteMutation.isPending ? 'Deleting…' : 'Yes, delete'}
              </button>
              <button type="button" onClick={() => setConfirmDelete(false)}
                className="rounded-md border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors">
                Cancel
              </button>
            </div>
          ) : (
            <button type="button" onClick={() => setConfirmDelete(true)}
              aria-label="Delete playlist"
              className="flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors">
              <Trash2 className="h-4 w-4" aria-hidden />
            </button>
          )}
        </>
      )}
    </div>
  );
}
