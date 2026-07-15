'use client';

import { useState } from 'react';
import { Plus, Check, ListMusic, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useMyPlaylists } from '@/hooks/use-playlists';
import { useAddTrackToPlaylist } from '@/hooks/use-playlists';

interface AddToPlaylistModalProps {
  trackId: string;
  onClose: () => void;
}

export function AddToPlaylistModal({ trackId, onClose }: AddToPlaylistModalProps) {
  const { data, isLoading } = useMyPlaylists({ limit: 50 });
  const [added, setAdded] = useState<Set<string>>(new Set());

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-50 bg-black/70" onClick={onClose} aria-hidden />

      {/* Modal */}
      <div
        role="dialog"
        aria-label="Add to playlist"
        className="fixed left-1/2 top-1/2 z-50 w-80 -translate-x-1/2 -translate-y-1/2 rounded-xl border border-border bg-card shadow-2xl animate-fade-in"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <h3 className="text-sm font-semibold">Add to playlist</h3>
          <button onClick={onClose} aria-label="Close" className="text-muted-foreground hover:text-foreground transition-colors">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Playlist list */}
        <div className="max-h-64 overflow-y-auto py-1">
          {isLoading && (
            <p className="px-4 py-6 text-sm text-muted-foreground text-center">Loading…</p>
          )}
          {!isLoading && !data?.items.length && (
            <p className="px-4 py-6 text-sm text-muted-foreground text-center">No playlists yet.</p>
          )}
          {data?.items.map((pl) => {
            const isAdded = added.has(pl.id);
            return (
              <PlaylistRow
                key={pl.id}
                playlistId={pl.id}
                title={pl.title}
                trackId={trackId}
                isAdded={isAdded}
                onAdded={() => setAdded((s) => new Set([...s, pl.id]))}
              />
            );
          })}
        </div>
      </div>
    </>
  );
}

function PlaylistRow({
  playlistId, title, trackId, isAdded, onAdded,
}: { playlistId: string; title: string; trackId: string; isAdded: boolean; onAdded: () => void }) {
  const addTrack = useAddTrackToPlaylist(playlistId);
  const handle = () => {
    if (isAdded) return;
    addTrack.mutate({ trackId }, { onSuccess: onAdded });
  };
  return (
    <button
      type="button"
      onClick={handle}
      disabled={isAdded || addTrack.isPending}
      className={cn(
        'flex w-full items-center gap-3 px-4 py-2.5 text-sm text-left transition-colors',
        isAdded ? 'text-primary' : 'text-foreground hover:bg-secondary',
        'disabled:cursor-default',
      )}
    >
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded bg-secondary border border-border">
        <ListMusic className="h-3.5 w-3.5 text-muted-foreground/50" />
      </div>
      <span className="flex-1 truncate">{title}</span>
      {isAdded
        ? <Check className="h-4 w-4 text-primary shrink-0" />
        : <Plus className="h-4 w-4 text-muted-foreground shrink-0" />}
    </button>
  );
}