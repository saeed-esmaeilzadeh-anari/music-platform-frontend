'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Plus, ListMusic, Globe, Lock, EyeOff, MoreHorizontal, Trash2, Pencil } from 'lucide-react';
import { useMyPlaylists, useDeletePlaylist } from '@/hooks/use-playlists';
import { PlaylistCreateModal } from '@/components/playlist/playlist-create-modal';
import { PlaylistEditModal }   from '@/components/playlist/playlist-edit-modal';
import { cn, formatDate } from '@/lib/utils';
import type { PlaylistResponse, PlaylistVisibility } from '@/types';

const VISIBILITY_ICONS: Record<PlaylistVisibility, React.ElementType> = {
  PUBLIC:   Globe,
  UNLISTED: EyeOff,
  PRIVATE:  Lock,
};

// ─── Playlist card ─────────────────────────────────────────────────────────────

function PlaylistCard({ playlist }: { playlist: PlaylistResponse }) {
  const [menuOpen,    setMenuOpen]    = useState(false);
  const [editOpen,    setEditOpen]    = useState(false);
  const deleteMutation                = useDeletePlaylist();
  const VisIcon                       = VISIBILITY_ICONS[playlist.visibility];

  const handleDelete = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!confirm(`Delete "${playlist.title}"? This cannot be undone.`)) return;
    deleteMutation.mutate(playlist.id);
    setMenuOpen(false);
  };

  return (
    <>
      <div className="group relative">
        <Link href={`/playlist/${playlist.id}`}
          className="block rounded-xl border border-border bg-card hover:border-primary/30 hover:bg-secondary/50 transition-all p-4">

          {/* Cover */}
          <div className="aspect-square w-full rounded-md bg-secondary border border-border overflow-hidden mb-4 flex items-center justify-center">
            {playlist.coverUrl
              ? <img src={playlist.coverUrl} alt={playlist.title} className="h-full w-full object-cover" />
              : <ListMusic className="h-12 w-12 text-muted-foreground/20" aria-hidden />}
          </div>

          {/* Info */}
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
              {playlist.title}
            </p>
            {playlist.description && (
              <p className="truncate text-xs text-muted-foreground mt-0.5">{playlist.description}</p>
            )}
            <div className="flex items-center gap-1.5 mt-2">
              <VisIcon className="h-3 w-3 text-muted-foreground/60 shrink-0" aria-hidden />
              <span className="text-[10px] text-muted-foreground/60">{playlist.visibility.toLowerCase()}</span>
              <span className="text-muted-foreground/40 text-[10px]">·</span>
              <span className="text-[10px] text-muted-foreground/60">{formatDate(playlist.createdAt, { year: 'numeric', month: 'short' })}</span>
            </div>
          </div>
        </Link>

        {/* Context menu trigger */}
        <div className="absolute top-2 right-2">
          <button type="button" onClick={e => { e.preventDefault(); setMenuOpen(v => !v); }}
            aria-label="Playlist options"
            className={cn(
              'flex h-8 w-8 items-center justify-center rounded-md',
              'bg-card/80 text-muted-foreground border border-border/50',
              'opacity-0 group-hover:opacity-100 transition-opacity',
              'hover:text-foreground hover:border-border',
              menuOpen && 'opacity-100',
            )}>
            <MoreHorizontal className="h-4 w-4" />
          </button>

          {menuOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} aria-hidden />
              <div className="absolute right-0 top-full mt-1 z-20 w-44 rounded-lg border border-border bg-card shadow-xl py-1">
                <button type="button" onClick={e => { e.preventDefault(); setEditOpen(true); setMenuOpen(false); }}
                  className="flex w-full items-center gap-2.5 px-3 py-2 text-sm text-foreground hover:bg-secondary transition-colors">
                  <Pencil className="h-3.5 w-3.5 shrink-0" /> Edit
                </button>
                <div className="my-1 border-t border-border" />
                <button type="button" onClick={handleDelete} disabled={deleteMutation.isPending}
                  className="flex w-full items-center gap-2.5 px-3 py-2 text-sm text-destructive hover:bg-destructive/10 transition-colors disabled:opacity-50">
                  <Trash2 className="h-3.5 w-3.5 shrink-0" />
                  {deleteMutation.isPending ? 'Deleting…' : 'Delete'}
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {editOpen && <PlaylistEditModal playlist={playlist} onClose={() => setEditOpen(false)} />}
    </>
  );
}

// ─── LibraryClient ─────────────────────────────────────────────────────────────

export function LibraryClient() {
  const [createOpen, setCreateOpen] = useState(false);
  const { data, isLoading }         = useMyPlaylists({ limit: 50 });
  const playlists                   = data?.items ?? [];

  return (
    <div className="px-4 py-8 lg:px-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Your Library</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {playlists.length} playlist{playlists.length !== 1 ? 's' : ''}
          </p>
        </div>
        <button type="button" onClick={() => setCreateOpen(true)}
          className="flex items-center gap-2 rounded-md bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90 transition-opacity">
          <Plus className="h-4 w-4" aria-hidden />
          New playlist
        </button>
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="space-y-3">
              <div className="aspect-square w-full rounded-md bg-secondary animate-pulse" />
              <div className="h-3.5 w-3/4 rounded bg-secondary animate-pulse" />
              <div className="h-3 w-1/2 rounded bg-secondary animate-pulse" />
            </div>
          ))}
        </div>
      ) : playlists.length === 0 ? (
        <div className="flex flex-col items-center gap-5 py-24 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-secondary border border-border">
            <ListMusic className="h-7 w-7 text-muted-foreground/40" />
          </div>
          <div>
            <p className="font-semibold">No playlists yet</p>
            <p className="mt-1 text-sm text-muted-foreground">Create your first playlist to organise your music.</p>
          </div>
          <button type="button" onClick={() => setCreateOpen(true)}
            className="flex items-center gap-2 rounded-md bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90 transition-opacity">
            <Plus className="h-4 w-4" /> Create playlist
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {playlists.map(pl => <PlaylistCard key={pl.id} playlist={pl} />)}
        </div>
      )}

      {/* Create modal */}
      {createOpen && (
        <PlaylistCreateModal
          onClose={() => setCreateOpen(false)}
          onCreated={() => setCreateOpen(false)}
        />
      )}
    </div>
  );
}
