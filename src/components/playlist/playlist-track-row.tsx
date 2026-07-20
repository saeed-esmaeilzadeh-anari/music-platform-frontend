'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Play, Pause, Trash2, MoreHorizontal,
  ChevronUp, ChevronDown, ListPlus, Heart,
} from 'lucide-react';
import { cn, formatDuration, formatRelativeTime } from '@/lib/utils';
import { usePlayTrack } from '@/hooks/use-player';
import { useAddFavorite } from '@/hooks/use-catalog';
import { useRemoveTrackFromPlaylist, useReorderPlaylistTrack } from '@/hooks/use-playlists';
import { CoverImage } from '@/components/shared/cover-image';
import { AddToPlaylistModal } from '@/components/shared/add-to-playlist-modal';
import { ROUTES } from '@/lib/constants';
import type { TrackResponse } from '@/types';

interface PlaylistTrackRowProps {
  track: TrackResponse;
  index: number;
  totalTracks: number;
  queue: TrackResponse[];
  playlistId: string;
  isOwner: boolean;
  /** ISO string of when this track was added to the playlist */
  addedAt?: string;
}

export function PlaylistTrackRow({
  track,
  index,
  totalTracks,
  queue,
  playlistId,
  isOwner,
  addedAt,
}: PlaylistTrackRowProps) {
  const { isCurrentTrack, isThisPlaying, handlePlay } = usePlayTrack(track, queue);
  const addFav      = useAddFavorite();
  const removeTrack = useRemoveTrackFromPlaylist(playlistId);
  const reorder     = useReorderPlaylistTrack(playlistId);

  const [menuOpen, setMenuOpen]             = useState(false);
  const [showAddToPlaylist, setShowAddToPlaylist] = useState(false);

  const moveUp = () => {
    if (index === 0) return;
    reorder.mutate({ trackId: track.id, position: index - 1 });
  };

  const moveDown = () => {
    if (index >= totalTracks - 1) return;
    reorder.mutate({ trackId: track.id, position: index + 1 });
  };

  return (
    <>
      <div
        className={cn(
          'group flex items-center gap-3 rounded-md px-3 py-2.5 transition-colors',
          'hover:bg-secondary',
          isCurrentTrack && 'bg-primary/5',
        )}
      >
        {/* ── Index / Play button ── */}
        <div className="flex h-8 w-8 shrink-0 items-center justify-center">
          {isCurrentTrack ? (
            <button
              type="button"
              onClick={handlePlay}
              aria-label={isThisPlaying ? 'Pause' : 'Play'}
              className="text-primary"
            >
              {isThisPlaying
                ? <Pause className="h-4 w-4 fill-current" aria-hidden />
                : <Play  className="h-4 w-4 fill-current translate-x-px" aria-hidden />}
            </button>
          ) : (
            <>
              <span className="text-sm tabular-nums text-muted-foreground group-hover:hidden select-none">
                {index + 1}
              </span>
              <button
                type="button"
                onClick={handlePlay}
                aria-label={`Play ${track.title}`}
                className="hidden group-hover:flex text-foreground"
              >
                <Play className="h-4 w-4 fill-current translate-x-px" aria-hidden />
              </button>
            </>
          )}
        </div>

        {/* ── Cover ── */}
        <div className="h-9 w-9 shrink-0 overflow-hidden rounded bg-secondary border border-border">
          <CoverImage src={track.coverUrl} alt={track.title} type="track" size="xl" />
        </div>

        {/* ── Title + artist ── */}
        <div className="flex-1 min-w-0">
          <Link
            href={ROUTES.TRACK(track.id)}
            className={cn(
              'block truncate text-sm font-medium leading-tight hover:underline',
              isCurrentTrack ? 'text-primary' : 'text-foreground',
            )}
          >
            {track.title}
          </Link>
          <Link
            href={ROUTES.ARTIST(track.artist.id)}
            className="block truncate text-xs text-muted-foreground hover:text-foreground hover:underline mt-0.5"
          >
            {track.artist.stageName}
          </Link>
        </div>

        {/* ── Added date (desktop) ── */}
        {addedAt && (
          <span className="hidden lg:block text-xs text-muted-foreground tabular-nums shrink-0 w-24 text-right">
            {formatRelativeTime(addedAt)}
          </span>
        )}

        {/* ── Duration ── */}
        <span className="text-xs text-muted-foreground tabular-nums w-10 text-right shrink-0">
          {formatDuration(track.durationSec)}
        </span>

        {/* ── Actions (revealed on hover) ── */}
        <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
          {/* Like */}
          <button
            type="button"
            onClick={() => addFav.mutate(track.id)}
            aria-label="Like track"
            className="flex h-7 w-7 items-center justify-center rounded text-muted-foreground hover:text-primary transition-colors"
          >
            <Heart className="h-3.5 w-3.5" aria-hidden />
          </button>

          {/* Reorder (owner only, desktop) */}
          {isOwner && (
            <div className="hidden md:flex flex-col">
              <button
                type="button"
                onClick={moveUp}
                disabled={index === 0 || reorder.isPending}
                aria-label="Move up"
                className="flex h-4 w-6 items-center justify-center text-muted-foreground hover:text-foreground transition-colors disabled:opacity-30"
              >
                <ChevronUp className="h-3 w-3" aria-hidden />
              </button>
              <button
                type="button"
                onClick={moveDown}
                disabled={index >= totalTracks - 1 || reorder.isPending}
                aria-label="Move down"
                className="flex h-4 w-6 items-center justify-center text-muted-foreground hover:text-foreground transition-colors disabled:opacity-30"
              >
                <ChevronDown className="h-3 w-3" aria-hidden />
              </button>
            </div>
          )}

          {/* Context menu */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setMenuOpen((v) => !v)}
              aria-label="More options"
              aria-expanded={menuOpen}
              className="flex h-7 w-7 items-center justify-center rounded text-muted-foreground hover:text-foreground transition-colors"
            >
              <MoreHorizontal className="h-3.5 w-3.5" aria-hidden />
            </button>

            {menuOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} aria-hidden />
                <div className="absolute right-0 top-full mt-1 z-20 w-48 rounded-lg border border-border bg-card shadow-xl py-1 animate-fade-in">
                  <button
                    type="button"
                    onClick={() => { setShowAddToPlaylist(true); setMenuOpen(false); }}
                    className="flex w-full items-center gap-2.5 px-3 py-2 text-sm text-foreground hover:bg-secondary transition-colors"
                  >
                    <ListPlus className="h-4 w-4 shrink-0" aria-hidden />
                    Add to another playlist
                  </button>

                  {isOwner && (
                    <>
                      <div className="my-1 border-t border-border" />
                      <button
                        type="button"
                        onClick={() => { removeTrack.mutate(track.id); setMenuOpen(false); }}
                        disabled={removeTrack.isPending}
                        className="flex w-full items-center gap-2.5 px-3 py-2 text-sm text-destructive hover:bg-destructive/10 transition-colors disabled:opacity-50"
                      >
                        <Trash2 className="h-4 w-4 shrink-0" aria-hidden />
                        Remove from playlist
                      </button>
                    </>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {showAddToPlaylist && (
        <AddToPlaylistModal
          trackId={track.id}
          onClose={() => setShowAddToPlaylist(false)}
        />
      )}
    </>
  );
}