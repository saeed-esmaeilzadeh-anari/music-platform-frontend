'use client';

import { useState, useRef, useEffect } from 'react';
import { Globe, Lock, EyeOff, Pencil } from 'lucide-react';
import { cn, formatDuration } from '@/lib/utils/index';
import { useUpdatePlaylist } from '@/hooks/use-playlists';
import { CoverImage } from '@/components/shared/cover-image';
import type { PlaylistResponse, PlaylistVisibility } from '@/types';

const VISIBILITY_CONFIG: Record<PlaylistVisibility, { icon: React.ElementType; label: string }> = {
  PUBLIC:   { icon: Globe,  label: 'Public playlist'   },
  UNLISTED: { icon: EyeOff, label: 'Unlisted playlist' },
  PRIVATE:  { icon: Lock,   label: 'Private playlist'  },
};

interface PlaylistHeaderProps {
  playlist: PlaylistResponse;
  trackCount: number;
  totalDurationSec: number;
  isOwner: boolean;
  onEditClick: () => void;
}

// ─── Inline-editable title ────────────────────────────────────────────────────

function InlineTitle({
  playlistId,
  title,
  isOwner,
}: { playlistId: string; title: string; isOwner: boolean }) {
  const [editing, setEditing]   = useState(false);
  const [draft, setDraft]       = useState(title);
  const inputRef                = useRef<HTMLInputElement>(null);
  const update                  = useUpdatePlaylist(playlistId);

  // Focus input when editing begins
  useEffect(() => {
    if (editing) inputRef.current?.select();
  }, [editing]);

  // Keep draft in sync if parent title changes (after save)
  useEffect(() => { setDraft(title); }, [title]);

  const save = () => {
    const trimmed = draft.trim();
    if (!trimmed || trimmed === title) { setDraft(title); setEditing(false); return; }
    update.mutate({ title: trimmed }, { onSettled: () => setEditing(false) });
  };

  const cancel = () => { setDraft(title); setEditing(false); };

  if (!isOwner) {
    return (
      <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight leading-tight break-words">
        {title}
      </h1>
    );
  }

  return editing ? (
    <input
      ref={inputRef}
      value={draft}
      onChange={(e) => setDraft(e.target.value)}
      onBlur={save}
      onKeyDown={(e) => {
        if (e.key === 'Enter') { e.preventDefault(); save(); }
        if (e.key === 'Escape') cancel();
      }}
      maxLength={150}
      aria-label="Playlist title"
      className={cn(
        'w-full bg-transparent border-b-2 border-primary outline-none',
        'text-3xl md:text-4xl font-extrabold tracking-tight leading-tight',
        'text-foreground placeholder:text-muted-foreground/40',
        update.isPending && 'opacity-60',
      )}
    />
  ) : (
    <button
      type="button"
      onClick={() => setEditing(true)}
      aria-label="Edit playlist title"
      className={cn(
        'group/title flex items-start gap-2 text-left w-full',
        'text-3xl md:text-4xl font-extrabold tracking-tight leading-tight',
        'text-foreground focus-visible:outline-none',
      )}
    >
      <span className="break-words">{title}</span>
      <Pencil
        className="mt-1.5 h-5 w-5 shrink-0 text-muted-foreground/40 opacity-0 group-hover/title:opacity-100 transition-opacity"
        aria-hidden
      />
    </button>
  );
}

// ─── PlaylistHeader ───────────────────────────────────────────────────────────

export function PlaylistHeader({
  playlist,
  trackCount,
  totalDurationSec,
  isOwner,
  onEditClick,
}: PlaylistHeaderProps) {
  const { icon: VisibilityIcon, label: visibilityLabel } =
    VISIBILITY_CONFIG[playlist.visibility];

  return (
    <div className="bg-gradient-to-b from-primary/20 via-secondary/60 to-background px-6 lg:px-8 pt-8 pb-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-end gap-6 max-w-5xl">
        {/* ── Cover art ── */}
        <button
          type="button"
          onClick={isOwner ? onEditClick : undefined}
          aria-label={isOwner ? 'Edit playlist cover' : undefined}
          className={cn(
            'relative h-44 w-44 shrink-0 rounded-md shadow-2xl overflow-hidden',
            isOwner && 'group/cover cursor-pointer',
          )}
        >
          <CoverImage
            src={playlist.coverUrl}
            alt={playlist.title}
            type="playlist"
            size="xl"
          />
          {isOwner && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black/60 opacity-0 group-hover/cover:opacity-100 transition-opacity">
              <Pencil className="h-8 w-8 text-white" aria-hidden />
              <span className="text-xs font-semibold text-white">Edit cover</span>
            </div>
          )}
        </button>

        {/* ── Metadata ── */}
        <div className="flex-1 min-w-0 pb-1 space-y-2">
          {/* Visibility badge */}
          <div className="flex items-center gap-1.5">
            <VisibilityIcon className="h-3.5 w-3.5 text-muted-foreground shrink-0" aria-hidden />
            <span className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
              {visibilityLabel}
            </span>
          </div>

          {/* Inline-editable title */}
          <InlineTitle
            playlistId={playlist.id}
            title={playlist.title}
            isOwner={isOwner}
          />

          {/* Description */}
          {playlist.description && (
            <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2 max-w-xl">
              {playlist.description}
            </p>
          )}

          {/* Stats row */}
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground flex-wrap pt-1">
            <span className="font-medium text-foreground">{trackCount} tracks</span>
            {totalDurationSec > 0 && (
              <>
                <span aria-hidden>·</span>
                <span>{formatDuration(totalDurationSec)}</span>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}