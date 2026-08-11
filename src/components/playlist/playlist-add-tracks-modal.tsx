'use client';

import { useState, useEffect } from 'react';
import { X, Search, Plus, Check, Loader2 } from 'lucide-react';
import { useAddTrackToPlaylist } from '@/hooks/use-playlists';
import { tracksService } from '@/services/tracks.service';
import { cn, formatDuration } from '@/lib/utils';
import type { TrackResponse } from '@/types';

function useDebounce<T>(value: T, ms = 350): T {
  const [dv, setDv] = useState(value);
  useEffect(() => { const t = setTimeout(() => setDv(value), ms); return () => clearTimeout(t); }, [value, ms]);
  return dv;
}

function useDebouncedTracks(query: string) {
  const [tracks, setTracks] = useState<TrackResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const debounced = useDebounce(query);

  useEffect(() => {
    if (!debounced.trim()) { setTracks([]); return; }
    let cancelled = false;
    setLoading(true);
    tracksService.findAll({ search: debounced, status: 'PUBLISHED', limit: 20 })
      .then(res => { if (!cancelled) setTracks(res.items); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [debounced]);

  return { tracks, loading };
}

interface Props { playlistId: string; existingTrackIds: Set<string>; onClose: () => void; }

function TrackRow({ track, playlistId, alreadyIn, onAdded }:
  { track: TrackResponse; playlistId: string; alreadyIn: boolean; onAdded: () => void }) {
  const addTrack = useAddTrackToPlaylist(playlistId);

  return (
    <div className={cn('flex items-center gap-3 px-5 py-2.5 transition-colors', alreadyIn ? 'opacity-50' : 'hover:bg-secondary')}>
      {/* Cover */}
      <div className="h-9 w-9 shrink-0 overflow-hidden rounded bg-secondary border border-border">
        {track.coverUrl
          ? <img src={track.coverUrl} alt="" className="h-full w-full object-cover" />
          : <div className="h-full w-full bg-secondary" />}
      </div>
      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="truncate text-sm font-medium text-foreground">{track.title}</p>
        <p className="truncate text-xs text-muted-foreground">{track.artist.stageName}</p>
      </div>
      <span className="hidden sm:block text-xs text-muted-foreground tabular-nums shrink-0">
        {formatDuration(track.durationSec)}
      </span>
      {/* Add button */}
      <button type="button" disabled={alreadyIn || addTrack.isPending}
        onClick={() => addTrack.mutate({ trackId: track.id }, { onSuccess: onAdded })}
        aria-label={alreadyIn ? 'Already added' : `Add ${track.title}`}
        className={cn(
          'flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-all',
          alreadyIn
            ? 'bg-emerald-500/15 text-emerald-500 cursor-default'
            : 'bg-secondary border border-border text-muted-foreground hover:bg-primary hover:text-primary-foreground hover:border-primary',
          addTrack.isPending && 'opacity-50 cursor-wait',
        )}>
        {addTrack.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
         : alreadyIn         ? <Check   className="h-3.5 w-3.5" />
                              : <Plus   className="h-3.5 w-3.5" />}
      </button>
    </div>
  );
}

export function PlaylistAddTracksModal({ playlistId, existingTrackIds, onClose }: Props) {
  const [query, setQuery] = useState('');
  const [added, setAdded] = useState<Set<string>>(new Set());
  const { tracks, loading } = useDebouncedTracks(query);

  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm" onClick={onClose} aria-hidden />
      <div role="dialog" aria-label="Add tracks" aria-modal="true"
        className="fixed left-1/2 top-1/2 z-50 w-full max-w-lg -translate-x-1/2 -translate-y-1/2 flex flex-col rounded-xl border border-border bg-card shadow-2xl max-h-[85vh]">

        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-5 py-4 shrink-0">
          <h2 className="text-sm font-semibold">Add tracks</h2>
          <button type="button" onClick={onClose} aria-label="Close"
            className="text-muted-foreground hover:text-foreground transition-colors">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Search */}
        <div className="px-5 py-3 border-b border-border shrink-0">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            {loading && <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground animate-spin" />}
            <input type="search" value={query} onChange={e => setQuery(e.target.value)}
              placeholder="Search tracks…" autoFocus aria-label="Search tracks"
              className="w-full rounded-md bg-secondary border border-border pl-10 pr-10 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 outline-none focus:border-primary/50 focus:ring-2 focus:ring-ring/20" />
          </div>
        </div>

        {/* Results */}
        <div className="flex-1 overflow-y-auto py-1">
          {!query.trim() && (
            <p className="px-5 py-8 text-sm text-muted-foreground text-center">Search for tracks to add.</p>
          )}
          {query.trim() && !loading && !tracks.length && (
            <p className="px-5 py-8 text-sm text-muted-foreground text-center">No tracks found.</p>
          )}
          {tracks.map(track => (
            <TrackRow key={track.id} track={track} playlistId={playlistId}
              alreadyIn={existingTrackIds.has(track.id) || added.has(track.id)}
              onAdded={() => setAdded(s => new Set([...s, track.id]))} />
          ))}
        </div>

        {/* Footer */}
        <div className="border-t border-border px-5 py-3 shrink-0">
          <p className="text-xs text-muted-foreground">
            {added.size > 0
              ? `${added.size} track${added.size > 1 ? 's' : ''} added`
              : 'Search and tap + to add tracks.'}
          </p>
        </div>
      </div>
    </>
  );
}
