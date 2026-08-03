'use client';

import { useState } from 'react';
import { Link2, Check, Globe, Lock, EyeOff } from 'lucide-react';
import { cn } from '@/lib/utils/index';
import { useUpdatePlaylist } from '@/hooks/use-playlists';
import type { PlaylistResponse, PlaylistVisibility } from '@/types';

interface PlaylistShareButtonProps {
  playlist: PlaylistResponse;
  isOwner: boolean;
}

const VISIBILITY_ICONS: Record<PlaylistVisibility, React.ElementType> = {
  PUBLIC:   Globe,
  UNLISTED: EyeOff,
  PRIVATE:  Lock,
};

const VISIBILITY_LABELS: Record<PlaylistVisibility, string> = {
  PUBLIC:   'Public',
  UNLISTED: 'Unlisted',
  PRIVATE:  'Private',
};

export function PlaylistShareButton({ playlist, isOwner }: PlaylistShareButtonProps) {
  const [open, setOpen]         = useState(false);
  const [copied, setCopied]     = useState(false);
  const update = useUpdatePlaylist(playlist.id);

  const shareUrl =
    typeof window !== 'undefined'
      ? `${window.location.origin}/playlist/${playlist.id}`
      : `/playlist/${playlist.id}`;

  const copyLink = async () => {
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const setVisibility = (v: PlaylistVisibility) => {
    if (v === playlist.visibility) return;
    update.mutate({ visibility: v });
    setOpen(false);
  };

  const VisibilityIcon = VISIBILITY_ICONS[playlist.visibility];

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="Share playlist"
        aria-expanded={open}
        className={cn(
          'flex items-center gap-2 rounded-md border border-border px-3 py-2',
          'text-sm text-muted-foreground hover:text-foreground hover:border-primary/40',
          'transition-colors',
          open && 'border-primary/40 text-foreground',
        )}
      >
        <Link2 className="h-4 w-4" aria-hidden />
        <span className="hidden sm:inline">Share</span>
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} aria-hidden />
          <div className={cn(
            'absolute left-0 top-full mt-2 z-20',
            'w-64 rounded-xl border border-border bg-card shadow-xl',
            'animate-fade-in',
          )}>
            {/* Copy link row */}
            <div className="p-3 border-b border-border">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60 mb-2">
                Copy link
              </p>
              <div className="flex items-center gap-2">
                <div className="flex-1 truncate rounded-md bg-secondary border border-border px-2.5 py-1.5 text-xs text-muted-foreground font-mono">
                  {shareUrl.replace('https://', '')}
                </div>
                <button
                  type="button"
                  onClick={copyLink}
                  aria-label={copied ? 'Copied!' : 'Copy link'}
                  className={cn(
                    'shrink-0 flex h-8 w-8 items-center justify-center rounded-md transition-colors',
                    copied
                      ? 'bg-emerald-500/15 text-emerald-500'
                      : 'bg-secondary border border-border text-muted-foreground hover:text-foreground',
                  )}
                >
                  {copied
                    ? <Check className="h-3.5 w-3.5" aria-hidden />
                    : <Link2 className="h-3.5 w-3.5" aria-hidden />}
                </button>
              </div>
              {playlist.visibility === 'PRIVATE' && (
                <p className="mt-2 text-[10px] text-amber-500/80 flex items-center gap-1">
                  <Lock className="h-3 w-3" />
                  Only you can open this link
                </p>
              )}
            </div>

            {/* Visibility picker (owner only) */}
            {isOwner && (
              <div className="p-3">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60 mb-2">
                  Who can see this
                </p>
                <div className="space-y-0.5">
                  {(['PUBLIC', 'UNLISTED', 'PRIVATE'] as PlaylistVisibility[]).map((v) => {
                    const Icon = VISIBILITY_ICONS[v];
                    const isActive = playlist.visibility === v;
                    return (
                      <button
                        key={v}
                        type="button"
                        onClick={() => setVisibility(v)}
                        disabled={update.isPending}
                        className={cn(
                          'flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors',
                          isActive
                            ? 'bg-primary/10 text-primary'
                            : 'text-muted-foreground hover:bg-secondary hover:text-foreground',
                          'disabled:opacity-50',
                        )}
                      >
                        <Icon className="h-4 w-4 shrink-0" aria-hidden />
                        <span>{VISIBILITY_LABELS[v]}</span>
                        {isActive && (
                          <Check className="ml-auto h-3.5 w-3.5 text-primary" aria-hidden />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}