'use client';

import { useState, useRef, useEffect } from 'react';
import { Globe, Lock, EyeOff, Pencil } from 'lucide-react';
import { useUpdatePlaylist } from '@/hooks/use-playlists';
import { PlaylistCoverUpload } from './playlist-cover-upload';
import { cn, formatDuration } from '@/lib/utils';
import type { PlaylistResponse, PlaylistVisibility } from '@/types';

const VISIBILITY_CONFIG: Record<PlaylistVisibility, { icon: React.ElementType; label: string }> = {
  PUBLIC:   { icon: Globe,  label: 'Public playlist'   },
  UNLISTED: { icon: EyeOff, label: 'Unlisted playlist' },
  PRIVATE:  { icon: Lock,   label: 'Private playlist'  },
};

// ─── Inline-editable title ────────────────────────────────────────────────────

function InlineTitle({ playlistId, title, isOwner }: { playlistId: string; title: string; isOwner: boolean }) {
  const [editing, setEditing] = useState(false);
  const [draft,   setDraft]   = useState(title);
  const inputRef              = useRef<HTMLInputElement>(null);
  const update                = useUpdatePlaylist(playlistId);

  useEffect(() => { if (editing) inputRef.current?.select(); }, [editing]);
  useEffect(() => { setDraft(title); }, [title]);

  const save = () => {
    const trimmed = draft.trim();
    if (!trimmed || trimmed === title) { setDraft(title); setEditing(false); return; }
    update.mutate({ title: trimmed }, { onSettled: () => setEditing(false) });
  };

  if (!isOwner) {
    return <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight leading-tight break-words">{title}</h1>;
  }

  return editing ? (
    <input ref={inputRef} value={draft} onChange={e => setDraft(e.target.value)}
      onBlur={save}
      onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); save(); } if (e.key === 'Escape') { setDraft(title); setEditing(false); } }}
      maxLength={150} aria-label="Playlist title"
      className={cn(
        'w-full bg-transparent border-b-2 border-primary outline-none',
        'text-3xl md:text-4xl font-extrabold tracking-tight leading-tight text-foreground',
        update.isPending && 'opacity-60',
      )} />
  ) : (
    <button type="button" onClick={() => setEditing(true)} aria-label="Edit playlist title"
      className="group/title flex items-start gap-2 text-left w-full focus-visible:outline-none">
      <span className="text-3xl md:text-4xl font-extrabold tracking-tight leading-tight text-foreground break-words">
        {title}
      </span>
      <Pencil className="mt-2 h-5 w-5 shrink-0 text-muted-foreground/40 opacity-0 group-hover/title:opacity-100 transition-opacity" aria-hidden />
    </button>
  );
}

// ─── PlaylistHeader ────────────────────────────────────────────────────────────

interface PlaylistHeaderProps {
  playlist: PlaylistResponse;
  trackCount: number;
  totalDurationSec: number;
  isOwner: boolean;
  onEditClick: () => void;
}

export function PlaylistHeader({ playlist, trackCount, totalDurationSec, isOwner, onEditClick }: PlaylistHeaderProps) {
  const { icon: VisibilityIcon, label: visibilityLabel } = VISIBILITY_CONFIG[playlist.visibility];

  return (
    <div className="bg-gradient-to-b from-primary/20 via-secondary/60 to-background px-6 lg:px-8 pt-8 pb-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-end gap-6 max-w-5xl">

        {/* Cover */}
        <PlaylistCoverUpload
          playlistId={playlist.id}
          currentCoverUrl={playlist.coverUrl}
          isOwner={isOwner}
          className="h-44 w-44 shrink-0"
        />

        {/* Metadata */}
        <div className="flex-1 min-w-0 pb-1 space-y-2">
          <div className="flex items-center gap-1.5">
            <VisibilityIcon className="h-3.5 w-3.5 text-muted-foreground shrink-0" aria-hidden />
            <span className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
              {visibilityLabel}
            </span>
          </div>

          <InlineTitle playlistId={playlist.id} title={playlist.title} isOwner={isOwner} />

          {playlist.description && (
            <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2 max-w-xl">
              {playlist.description}
            </p>
          )}

          <div className="flex items-center gap-1.5 text-sm text-muted-foreground flex-wrap pt-1">
            <span className="font-medium text-foreground">{trackCount} tracks</span>
            {totalDurationSec > 0 && (
              <><span aria-hidden>·</span><span>{formatDuration(totalDurationSec)}</span></>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
