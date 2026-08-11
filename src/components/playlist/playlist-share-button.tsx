'use client';

import { useState } from 'react';
import { Link2, Check, Globe, EyeOff, Lock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useUpdatePlaylist } from '@/hooks/use-playlists';
import { useToast } from '@/providers/toast-provider';
import type { PlaylistResponse, PlaylistVisibility } from '@/types';

const VISIBILITY_CONFIG: Record<PlaylistVisibility, { icon: React.ElementType; label: string }> = {
  PUBLIC:   { icon: Globe,  label: 'Public'   },
  UNLISTED: { icon: EyeOff, label: 'Unlisted' },
  PRIVATE:  { icon: Lock,   label: 'Private'  },
};

interface PlaylistShareButtonProps {
  playlist: PlaylistResponse;
  isOwner: boolean;
}

export function PlaylistShareButton({ playlist, isOwner }: PlaylistShareButtonProps) {
  const [open,   setOpen]   = useState(false);
  const [copied, setCopied] = useState(false);
  const { success }         = useToast();
  const update              = useUpdatePlaylist(playlist.id);

  const shareUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/playlist/${playlist.id}`
    : `/playlist/${playlist.id}`;

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      success('Link copied!');
    } catch {
      // Fallback for browsers without clipboard API
      const el = document.createElement('textarea');
      el.value = shareUrl;
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const setVisibility = (v: PlaylistVisibility) => {
    if (v === playlist.visibility) return;
    update.mutate({ visibility: v });
    setOpen(false);
  };

  const { icon: VisibilityIcon } = VISIBILITY_CONFIG[playlist.visibility];

  return (
    <div className="relative">
      <button type="button" onClick={() => setOpen(v => !v)} aria-expanded={open}
        aria-label="Share playlist"
        className={cn(
          'flex items-center gap-2 rounded-md border border-border px-3 py-2 text-sm',
          'text-muted-foreground hover:text-foreground hover:border-primary/40 transition-colors',
          open && 'border-primary/40 text-foreground',
        )}>
        <Link2 className="h-4 w-4" aria-hidden />
        <span className="hidden sm:inline">Share</span>
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} aria-hidden />
          <div className="absolute left-0 top-full mt-2 z-20 w-68 min-w-[260px] rounded-xl border border-border bg-card shadow-xl">

            {/* Copy link */}
            <div className="p-3 border-b border-border">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60 mb-2">
                Copy link
              </p>
              <div className="flex items-center gap-2">
                <div className="flex-1 truncate rounded-md bg-secondary border border-border px-2.5 py-1.5 text-xs text-muted-foreground font-mono">
                  {shareUrl.replace(/^https?:\/\//, '')}
                </div>
                <button type="button" onClick={copyLink} aria-label={copied ? 'Copied' : 'Copy link'}
                  className={cn(
                    'shrink-0 flex h-8 w-8 items-center justify-center rounded-md transition-colors',
                    copied
                      ? 'bg-emerald-500/15 text-emerald-500'
                      : 'bg-secondary border border-border text-muted-foreground hover:text-foreground',
                  )}>
                  {copied ? <Check className="h-3.5 w-3.5" /> : <Link2 className="h-3.5 w-3.5" />}
                </button>
              </div>
              {playlist.visibility === 'PRIVATE' && (
                <p className="mt-2 flex items-center gap-1 text-[10px] text-amber-500/80">
                  <Lock className="h-3 w-3" /> Only you can open this link
                </p>
              )}
            </div>

            {/* Visibility picker (owner only) */}
            {isOwner && (
              <div className="p-3">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60 mb-2">
                  Who can see this
                </p>
                {(['PUBLIC', 'UNLISTED', 'PRIVATE'] as PlaylistVisibility[]).map((v) => {
                  const { icon: Icon, label } = VISIBILITY_CONFIG[v];
                  const isActive = playlist.visibility === v;
                  return (
                    <button key={v} type="button" onClick={() => setVisibility(v)}
                      disabled={update.isPending}
                      className={cn(
                        'flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors',
                        isActive
                          ? 'bg-primary/10 text-primary'
                          : 'text-muted-foreground hover:bg-secondary hover:text-foreground',
                        'disabled:opacity-50',
                      )}>
                      <Icon className="h-4 w-4 shrink-0" />
                      <span className="flex-1 text-left">{label}</span>
                      {isActive && <Check className="h-3.5 w-3.5 text-primary" />}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
