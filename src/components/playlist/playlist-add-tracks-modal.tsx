'use client';

import { useState, useEffect } from 'react';
import { Search, X, Plus, Check, Loader2 } from 'lucide-react';
import { cn, formatDuration } from '@/lib/utils';
import { useAddTrackToPlaylist } from '@/hooks/use-playlists';
import { useTracks } from '@/hooks/use-tracks';
import { CoverImage } from '@/components/shared/cover-image';
import type { TrackResponse } from '@/types';

interface PlaylistAddTracksModalProps {
  playlistId: string;
  existingTrackIds: Set<string>;
  onClose: () => void;
}

function useDebounce<T>(value: T, delay = 350): T {
  const [dv, setDv] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDv(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return dv;
}

export function PlaylistAddTracksModal({
  playlistId,
  existingTrackIds,
  onClose,
}: PlaylistAddTracksModalProps) {
  const [query, setQuery]           = useState('');
  const [added, setAdded]           = useState<Set<string>>(new Set());
  const debounced                   = useDebounce(query);

  const { data, isFetching } = useTracks({
    search: debounced || undefined,
    status: 'PUBLISHED',
    limit: 20,
  });

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm" onClick={onClose} aria-hidden />

      {/* Modal */}
      <div
        role="dialog"
        aria-label="Add tracks to playlist"
        aria-modal="true"
        className={cn(
          'fixed left-1/2 top-1/2 z-50 w-full max-w-lg -translate-x-1/2 -translate-y-1/2',
          'flex flex-col rounded-xl border border-border bg-card shadow-2xl animate-fade-in',
          'max-h-[85vh]',
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-5 py-4 shrink-0">
          <h2 className="text-sm font-semibold">Add tracks</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="h-4 w-4" aria-hidden />
          </button>
        </div>

        {/* Search input */}
        <div className="px-5 py-3 border-b border-border shrink-0">
          <div className="relative">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"
              aria-hidden
            />
            {isFetching && (
              <Loader2
                className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground animate-spin"
                aria-hidden
              />
            )}
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search tracks…"
              autoFocus
              aria-label="Search tracks"
              className={cn(
                'w-full rounded-md bg-secondary border border-border',
                'pl-10 pr-10 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/50',
                'outline-none focus:border-primary/50 focus:ring-2 focus:ring-ring/20',
              )}
            />
          </div>
        </div>

        {/* Results */}
        <div className="flex-1 overflow-y-auto py-1">
          {!data?.items.length && !isFetching && (
            <p className="px-5 py-8 text-sm text-muted-foreground text-center">
              {query ? 'No tracks found.' : 'Search for tracks to add.'}
            </p>
          )}

          {data?.items.map((track) => (
            <TrackAddRow
              key={track.id}
              track={track}
              playlistId={playlistId}
              alreadyIn={existingTrackIds.has(track.id) || added.has(track.id)}
              onAdded={() => setAdded((s) => new Set([...s, track.id]))}
            />
          ))}
        </div>

        {/* Footer */}
        <div className="border-t border-border px-5 py-3 shrink-0">
          <p className="text-xs text-muted-foreground">
            {added.size > 0
              ? `${added.size} track${added.size > 1 ? 's' : ''} added`
              : 'Search and click + to add tracks to this playlist.'}
          </p>
        </div>
      </div>
    </>
  );
}

// ─── Single track row inside the modal ───────────────────────────────────────

function TrackAddRow({
  track, playlistId, alreadyIn, onAdded,
}: {
  track: TrackResponse;
  playlistId: string;
  alreadyIn: boolean;
  onAdded: () => void;
}) {
  const addTrack = useAddTrackToPlaylist(playlistId);

  const handleAdd = () => {
    if (alreadyIn || addTrack.isPending) return;
    addTrack.mutate({ trackId: track.id }, { onSuccess: onAdded });
  };

  return (
    <div className={cn(
      'flex items-center gap-3 px-5 py-2.5 transition-colors',
      alreadyIn ? 'opacity-50' : 'hover:bg-secondary',
    )}>
      {/* Cover */}
      <div className="h-9 w-9 shrink-0 overflow-hidden rounded bg-secondary border border-border">
        <CoverImage src={track.coverUrl} alt={track.title} type="track" size="xl" />
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="truncate text-sm font-medium text-foreground">{track.title}</p>
        <p className="truncate text-xs text-muted-foreground">{track.artist.stageName}</p>
      </div>

      {/* Duration */}
      <span className="hidden sm:block text-xs text-muted-foreground tabular-nums shrink-0">
        {formatDuration(track.durationSec)}
      </span>

      {/* Add / Added button */}
      <button
        type="button"
        onClick={handleAdd}
        disabled={alreadyIn || addTrack.isPending}
        aria-label={alreadyIn ? 'Already in playlist' : `Add ${track.title}`}
        className={cn(
          'flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-all',
          alreadyIn
            ? 'bg-emerald-500/15 text-emerald-500 cursor-default'
            : 'bg-secondary border border-border text-muted-foreground hover:bg-primary hover:text-primary-foreground hover:border-primary',
          addTrack.isPending && 'opacity-50 cursor-wait',
        )}
      >
        {addTrack.isPending
          ? <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />
          : alreadyIn
            ? <Check className="h-3.5 w-3.5" aria-hidden />
            : <Plus className="h-3.5 w-3.5" aria-hidden />}
      </button>
    </div>
  );
}