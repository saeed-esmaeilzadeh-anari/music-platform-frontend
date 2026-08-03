'use client';

import { useState, useEffect } from 'react';
import { Play, Pause, SkipForward, ChevronDown } from 'lucide-react';
import { cn, formatDuration } from '@/lib/utils/index';
import { usePlayerStore } from '@/stores/player.store';

/**
 * MiniPlayer
 *
 * Floating compact player shown on mobile when the main PlayerBar
 * scrolls out of view. Uses IntersectionObserver on the element with
 * id="player-bar-sentinel" (rendered inside PlayerBar) — no ref prop
 * needed, works across the server/client component boundary.
 *
 * Hidden on desktop (md+) — the sticky PlayerBar is always visible there.
 */
export function MiniPlayer() {
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  const {
    currentTrack, isPlaying, isLoading,
    progressSec, durationSec,
    togglePlay, playNext, seekTo,
  } = usePlayerStore();

  // Observe the sentinel element inside PlayerBar
  useEffect(() => {
    const sentinel = document.getElementById('player-bar-sentinel');
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setVisible(!entry.isIntersecting);
        if (entry.isIntersecting) setDismissed(false);
      },
      { threshold: 0 },
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, []);

  if (!currentTrack || !visible || dismissed) return null;

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
      {/* Seek strip */}
      <div
        className="h-0.5 w-full cursor-pointer rounded-t-xl overflow-hidden bg-secondary"
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
      </div>

      <div className="flex items-center gap-3 p-3">
        {/* Cover */}
        <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-md bg-secondary border border-border">
          {currentTrack.coverUrl && (
            <img src={currentTrack.coverUrl} alt="" className="h-full w-full object-cover" />
          )}
          {isLoading && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <div className="h-3 w-3 rounded-full border-2 border-primary border-t-transparent animate-spin" />
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <p className="truncate text-sm font-semibold">{currentTrack.title}</p>
          <p className="truncate text-xs text-muted-foreground">
            {currentTrack.artist.stageName}
          </p>
        </div>

        {/* Time */}
        <span className="hidden sm:block text-[10px] tabular-nums text-muted-foreground shrink-0">
          {formatDuration(progressSec)}&thinsp;/&thinsp;{formatDuration(durationSec)}
        </span>

        {/* Controls */}
        <div className="flex items-center gap-0.5 shrink-0">
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
            className="flex h-9 w-9 items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
          >
            <SkipForward className="h-4 w-4" aria-hidden />
          </button>
          <button
            type="button"
            onClick={() => setDismissed(true)}
            aria-label="Dismiss mini player"
            className="flex h-9 w-9 items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
          >
            <ChevronDown className="h-4 w-4" aria-hidden />
          </button>
        </div>
      </div>
    </div>
  );
}
