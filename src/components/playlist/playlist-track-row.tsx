'use client';

import { useState } from 'react';
import { MoreHorizontal, Trash2, ChevronUp, ChevronDown, Heart, ListPlus } from 'lucide-react';
import { useRemoveTrackFromPlaylist, useReorderPlaylistTrack } from '@/hooks/use-playlists';
import { useToast } from '@/providers/toast-provider';
import { cn, formatDuration, formatRelativeTime } from '@/lib/utils';
import type { TrackResponse } from '@/types';

interface PlaylistTrackRowProps {
  track: TrackResponse;
  index: number;
  totalTracks: number;
  playlistId: string;
  isOwner: boolean;
  addedAt?: string;
  isCurrent?: boolean;
  isPlaying?: boolean;
  onPlay: () => void;
  onAddToOther?: () => void;
}

export function PlaylistTrackRow({
  track, index, totalTracks, playlistId, isOwner,
  addedAt, isCurrent, isPlaying, onPlay, onAddToOther,
}: PlaylistTrackRowProps) {
  const removeTrack = useRemoveTrackFromPlaylist(playlistId);
  const reorder     = useReorderPlaylistTrack(playlistId);
  const [menuOpen, setMenuOpen] = useState(false);
  const { error: toast } = useToast();

  const handleRemove = () => {
    setMenuOpen(false);
    removeTrack.mutate(track.id, {
      onError: () => toast('Failed to remove', 'Please try again.'),
    });
  };

  const moveUp = () => {
    if (index === 0) return;
    reorder.mutate({ trackId: track.id, position: index - 1 });
  };

  const moveDown = () => {
    if (index >= totalTracks - 1) return;
    reorder.mutate({ trackId: track.id, position: index + 1 });
  };

  return (
    <div className={cn(
      'group flex items-center gap-3 rounded-md px-3 py-2.5 transition-colors select-none',
      'hover:bg-secondary',
      isCurrent && 'bg-primary/5',
    )}>
      {/* Index / play */}
      <div className="flex h-8 w-8 shrink-0 items-center justify-center">
        {isCurrent ? (
          <button type="button" onClick={onPlay} aria-label={isPlaying ? 'Pause' : 'Play'}
            className="text-primary">
            {isPlaying
              ? <span className="flex items-end gap-px h-4" aria-hidden>
                  {[1.0,1.6,1.2].map((h,i) => (
                    <span key={i} className="w-[3px] rounded-full bg-primary animate-pulse" style={{ height: `${h*10}px`, animationDelay: `${i*0.15}s` }} />
                  ))}
                </span>
              : <span className="text-primary text-xs translate-x-px">▶</span>}
          </button>
        ) : (
          <>
            <span className="text-sm tabular-nums text-muted-foreground group-hover:hidden">{index + 1}</span>
            <button type="button" onClick={onPlay} aria-label={`Play ${track.title}`}
              className="hidden group-hover:flex text-foreground">
              <span className="text-xs translate-x-px">▶</span>
            </button>
          </>
        )}
      </div>

      {/* Cover */}
      <div className="h-9 w-9 shrink-0 overflow-hidden rounded bg-secondary border border-border">
        {track.coverUrl
          ? <img src={track.coverUrl} alt="" className="h-full w-full object-cover" />
          : <div className="h-full w-full bg-secondary" />}
      </div>

      {/* Title + artist */}
      <div className="flex-1 min-w-0">
        <p className={cn('truncate text-sm font-medium leading-tight', isCurrent && 'text-primary')}>
          {track.title}
        </p>
        <p className="truncate text-xs text-muted-foreground mt-0.5">{track.artist.stageName}</p>
      </div>

      {/* Added date */}
      {addedAt && (
        <span className="hidden lg:block text-xs text-muted-foreground w-24 text-right shrink-0">
          {formatRelativeTime(addedAt)}
        </span>
      )}

      {/* Duration */}
      <span className="text-xs text-muted-foreground tabular-nums w-10 text-right shrink-0">
        {formatDuration(track.durationSec)}
      </span>

      {/* Actions */}
      <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
        {/* Reorder (owner, desktop) */}
        {isOwner && (
          <div className="hidden md:flex flex-col">
            <button type="button" onClick={moveUp} disabled={index === 0 || reorder.isPending}
              aria-label="Move up" className="flex h-4 w-5 items-center justify-center text-muted-foreground hover:text-foreground disabled:opacity-30 transition-colors">
              <ChevronUp className="h-3 w-3" />
            </button>
            <button type="button" onClick={moveDown} disabled={index >= totalTracks - 1 || reorder.isPending}
              aria-label="Move down" className="flex h-4 w-5 items-center justify-center text-muted-foreground hover:text-foreground disabled:opacity-30 transition-colors">
              <ChevronDown className="h-3 w-3" />
            </button>
          </div>
        )}

        {/* Context menu */}
        <div className="relative">
          <button type="button" onClick={() => setMenuOpen(v => !v)}
            aria-label="More options" aria-expanded={menuOpen}
            className="flex h-7 w-7 items-center justify-center rounded text-muted-foreground hover:text-foreground transition-colors">
            <MoreHorizontal className="h-3.5 w-3.5" />
          </button>

          {menuOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} aria-hidden />
              <div className="absolute right-0 top-full mt-1 z-20 w-52 rounded-lg border border-border bg-card shadow-xl py-1">
                {onAddToOther && (
                  <button type="button" onClick={() => { onAddToOther(); setMenuOpen(false); }}
                    className="flex w-full items-center gap-2.5 px-3 py-2 text-sm text-foreground hover:bg-secondary transition-colors">
                    <ListPlus className="h-4 w-4 shrink-0" />
                    Add to another playlist
                  </button>
                )}
                <button type="button" onClick={() => {}}
                  className="flex w-full items-center gap-2.5 px-3 py-2 text-sm text-foreground hover:bg-secondary transition-colors">
                  <Heart className="h-4 w-4 shrink-0" />
                  Like track
                </button>
                {isOwner && (
                  <>
                    <div className="my-1 border-t border-border" />
                    <button type="button" onClick={handleRemove} disabled={removeTrack.isPending}
                      className="flex w-full items-center gap-2.5 px-3 py-2 text-sm text-destructive hover:bg-destructive/10 transition-colors disabled:opacity-50">
                      <Trash2 className="h-4 w-4 shrink-0" />
                      {removeTrack.isPending ? 'Removing…' : 'Remove from playlist'}
                    </button>
                  </>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
