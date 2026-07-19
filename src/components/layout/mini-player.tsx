'use client';

import { useState, useEffect } from 'react';
import { Play, Pause, SkipForward, X, ChevronDown } from 'lucide-react';
import { cn, formatDuration } from '@/lib/utils';
import { usePlayerStore } from '@/stores/player.store';

/**
 * MiniPlayer
 *
 * A compact floating player that appears on mobile when the user scrolls
 * past the main PlayerBar. Shows cover, title, seek progress, and
 * play/pause + next controls.
 *
 * On desktop this is hidden — the bottom PlayerBar is always visible.
 * Controlled by scroll position relative to a sentinel element on the
 * PlayerBar; uses IntersectionObserver for zero-cost detection.
 */

interface MiniPlayerProps {
  /** Ref to the PlayerBar footer element — when it goes offscreen, mini shows */
  playerBarRef?: React.RefObject<HTMLElement>;
}

export function MiniPlayer({ playerBarRef }: MiniPlayerProps = {}) {
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  const {
    currentTrack, isPlaying, isLoading,
    progressSec, durationSec,
    togglePlay, playNext, seekTo,
  } = usePlayerStore();

  // Show when PlayerBar is not in viewport (mobile only)
  useEffect(() => {
    if (!playerBarRef?.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        setVisible(!entry.isIntersecting);
        if (entry.isIntersecting) setDismissed(false);
      },
      { threshold: 0, rootMargin: '0px' },
    );
    observer.observe(playerBarRef.current);
    return () => observer.disconnect();
  }, [playerBarRef]);

  if (!currentTrack) return null;
  if (!visible || dismissed) return null;

  const pct = durationSec > 0 ? (progressSec / durationSec) * 100 : 0;

  return (
    <div
      className={cn(
        'fixed bottom-4 left-4 right-4 z-50 md:hidden',
        'rounded-xl border border-border bg-card/95 shadow-2xl backdrop-blur-sm',
        'animate-fade-in',
      )}
      role="region"
      aria-label="Mini player"
    >
      {/* Seek strip at top */}
      <div
        className="h-0.5 w-full cursor-pointer rounded-t-xl overflow-hidden"
        onClick={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          seekTo(((e.clientX - rect.left) / rect.width) * durationSec);
        }}
        aria-hidden
      >
        <div
          className="h-full bg-primary transition-[width] duration-75"
          style={{ width: `${pct}%` }}
        />
        <div className="h-full flex-1 bg-secondary" />
      </div>

      <div className="flex items-center gap-3 p-3">
        {/* Cover */}
        <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-md bg-secondary border border-border">
          {currentTrack.coverUrl
            ? <img src={currentTrack.coverUrl} alt="" className="h-full w-full object-cover" />
            : null}
          {isLoading && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <div className="h-3 w-3 rounded-full border-2 border-primary border-t-transparent animate-spin" />
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <p className="truncate text-sm font-semibold text-foreground">{currentTrack.title}</p>
          <p className="truncate text-xs text-muted-foreground">{currentTrack.artist.stageName}</p>
        </div>

        {/* Time */}
        <span className="hidden sm:block text-[10px] tabular-nums text-muted-foreground shrink-0">
          {formatDuration(progressSec)} / {formatDuration(durationSec)}
        </span>

        {/* Controls */}
        <div className="flex items-center gap-1 shrink-0">
          <button
            type="button"
            onClick={togglePlay}
            aria-label={isPlaying ? 'Pause' : 'Play'}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-foreground text-background hover:scale-105 active:scale-95 transition-transform"
          >
            {isPlaying
              ? <Pause className="h-4 w-4 fill-current" aria-hidden />
              : <Play className="h-4 w-4 fill-current translate-x-px" aria-hidden />}
          </button>

          <button
            type="button"
            onClick={playNext}
            aria-label="Next"
            className="h-9 w-9 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
          >
            <SkipForward className="h-4 w-4" aria-hidden />
          </button>

          <button
            type="button"
            onClick={() => setDismissed(true)}
            aria-label="Dismiss mini player"
            className="h-9 w-9 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
          >
            <ChevronDown className="h-4 w-4" aria-hidden />
          </button>
        </div>
      </div>
    </div>
  );
}