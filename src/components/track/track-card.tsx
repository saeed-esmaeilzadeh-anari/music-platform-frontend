'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Play, Pause, MoreHorizontal, ListPlus, Heart } from 'lucide-react';
import { cn, formatDuration, formatCount } from '@/lib/utils/index';
import { usePlayTrack } from '@/hooks/use-player';
import { useAddFavorite } from '@/hooks/use-catalog';
import { CoverImage } from '@/components/shared/cover-image';
import { AddToPlaylistModal } from '@/components/shared/add-to-playlist-modal';
import { ROUTES } from '@/lib/constants';
import type { TrackResponse } from '@/types';

// ─── TrackRow ─────────────────────────────────────────────────────────────────

interface TrackRowProps {
  track: TrackResponse;
  index?: number;
  queue?: TrackResponse[];
  showArtist?: boolean;
}

export function TrackRow({ track, index, queue, showArtist = true }: TrackRowProps) {
  const { isCurrentTrack, isThisPlaying, handlePlay } = usePlayTrack(track, queue);
  const addFav = useAddFavorite();
  const [showPlaylistModal, setShowPlaylistModal] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      <div className={cn(
        'group flex items-center gap-3 rounded-md px-3 py-2.5 transition-colors cursor-default',
        'hover:bg-secondary',
        isCurrentTrack && 'bg-primary/5',
      )}>
        {/* Index / play */}
        <div className="flex h-8 w-8 shrink-0 items-center justify-center">
          {isCurrentTrack ? (
            <button type="button" onClick={handlePlay}
              aria-label={isThisPlaying ? 'Pause' : 'Play'}
              className="text-primary">
              {isThisPlaying
                ? <Pause className="h-4 w-4 fill-current" />
                : <Play className="h-4 w-4 fill-current translate-x-px" />}
            </button>
          ) : (
            <>
              {index !== undefined && (
                <span className="text-sm tabular-nums text-muted-foreground group-hover:hidden">
                  {index + 1}
                </span>
              )}
              <button type="button" onClick={handlePlay}
                aria-label={`Play ${track.title}`}
                className={cn(
                  'text-foreground',
                  index !== undefined ? 'hidden group-hover:flex' : 'flex',
                )}>
                <Play className="h-4 w-4 fill-current translate-x-px" />
              </button>
            </>
          )}
        </div>

        {/* Cover (when no index — search results) */}
        {index === undefined && (
          <CoverImage src={track.coverUrl} alt={track.title} type="track" size="sm" className="rounded" />
        )}

        {/* Title + artist */}
        <div className="flex-1 min-w-0">
          <p className={cn('truncate text-sm font-medium leading-tight', isCurrentTrack && 'text-primary')}>
            {track.title}
          </p>
          {showArtist && (
            <p className="truncate text-xs text-muted-foreground mt-0.5">
              <Link href={ROUTES.ARTIST(track.artist.id)}
                className="hover:text-foreground hover:underline transition-colors">
                {track.artist.stageName}
              </Link>
            </p>
          )}
        </div>

        {/* Play count */}
        <span className="hidden md:block text-xs text-muted-foreground tabular-nums w-14 text-right shrink-0">
          {formatCount(track.playCount)}
        </span>

        {/* Duration */}
        <span className="text-xs text-muted-foreground tabular-nums w-10 text-right shrink-0">
          {formatDuration(track.durationSec)}
        </span>

        {/* Actions */}
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button type="button" onClick={() => addFav.mutate(track.id)}
            aria-label="Like" className="p-1 text-muted-foreground hover:text-primary transition-colors">
            <Heart className="h-3.5 w-3.5" />
          </button>
          <div className="relative">
            <button type="button" onClick={() => setMenuOpen((v) => !v)}
              aria-label="More options"
              className="p-1 text-muted-foreground hover:text-foreground transition-colors">
              <MoreHorizontal className="h-3.5 w-3.5" />
            </button>
            {menuOpen && (
              <div className="absolute right-0 top-full mt-1 z-10 w-44 rounded-lg border border-border bg-card shadow-lg py-1">
                <button type="button"
                  onClick={() => { setShowPlaylistModal(true); setMenuOpen(false); }}
                  className="flex w-full items-center gap-2.5 px-3 py-2 text-xs text-foreground hover:bg-secondary transition-colors">
                  <ListPlus className="h-3.5 w-3.5" /> Add to playlist
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {showPlaylistModal && (
        <AddToPlaylistModal trackId={track.id} onClose={() => setShowPlaylistModal(false)} />
      )}
    </>
  );
}

// ─── TrackCard ────────────────────────────────────────────────────────────────

interface TrackCardProps {
  track: TrackResponse;
  queue?: TrackResponse[];
}

export function TrackCard({ track, queue }: TrackCardProps) {
  const { isCurrentTrack, isThisPlaying, handlePlay } = usePlayTrack(track, queue);

  return (
    <Link href={ROUTES.TRACK(track.id)} className="group block space-y-3">
      <div className="relative aspect-square overflow-hidden rounded-md bg-secondary">
        <CoverImage src={track.coverUrl} alt={track.title} type="track" size="xl" />
        <button
          type="button"
          onClick={(e) => { e.preventDefault(); handlePlay(); }}
          aria-label={isThisPlaying ? 'Pause' : `Play ${track.title}`}
          className={cn(
            'absolute bottom-2 right-2 flex h-10 w-10 items-center justify-center rounded-full',
            'bg-primary text-primary-foreground shadow-lg',
            'translate-y-2 opacity-0 transition-all duration-200',
            'group-hover:translate-y-0 group-hover:opacity-100',
            isCurrentTrack && 'translate-y-0 opacity-100',
          )}
        >
          {isThisPlaying
            ? <Pause className="h-4 w-4 fill-current" />
            : <Play className="h-4 w-4 fill-current translate-x-px" />}
        </button>
      </div>
      <div className="px-1">
        <p className={cn('truncate text-sm font-medium', isCurrentTrack && 'text-primary')}>
          {track.title}
        </p>
        <p className="truncate text-xs text-muted-foreground mt-0.5">
          {track.artist.stageName}
        </p>
      </div>
    </Link>
  );
}
