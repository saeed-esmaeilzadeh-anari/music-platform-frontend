'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  ChevronDown, Play, Pause, SkipBack, SkipForward,
  Shuffle, Repeat, Repeat1, Volume2, VolumeX,
  Heart, ListMusic, MoreHorizontal,
} from 'lucide-react';
import { cn, formatDuration } from '@/lib/utils/index';
import { usePlayerStore } from '@/stores/player.store';
import { useUIStore } from '@/stores/ui.store';
import { useAddFavorite } from '@/hooks/use-catalog';
import { ROUTES } from '@/lib/constants';

interface FullscreenPlayerProps {
  onClose: () => void;
}

export function FullscreenPlayer({ onClose }: FullscreenPlayerProps) {
  const {
    currentTrack, isPlaying, isLoading,
    repeatMode, isShuffled,
    progressSec, durationSec,
    volume, isMuted,
    togglePlay, playNext, playPrevious,
    cycleRepeat, toggleShuffle,
    seekTo, setVolume, toggleMute,
  } = usePlayerStore();
  const { toggleQueuePanel } = useUIStore();
  const addFav = useAddFavorite();

  if (!currentTrack) return null;

  const pct = durationSec > 0 ? (progressSec / durationSec) * 100 : 0;

  return (
    <div
      className={cn(
        'fixed inset-0 z-50 flex flex-col',
        'bg-gradient-to-b from-primary/20 via-background to-background',
        'animate-fade-in',
      )}
      role="dialog"
      aria-label="Now playing"
      aria-modal="true"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-6 pt-safe-top pt-6 pb-4">
        <button
          type="button"
          onClick={onClose}
          aria-label="Collapse player"
          className="flex h-9 w-9 items-center justify-center rounded-full bg-secondary/50 text-foreground hover:bg-secondary transition-colors"
        >
          <ChevronDown className="h-5 w-5" aria-hidden />
        </button>

        <div className="text-center">
          <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
            Now playing
          </p>
        </div>

        <button
          type="button"
          onClick={toggleQueuePanel}
          aria-label="Open queue"
          className="flex h-9 w-9 items-center justify-center rounded-full bg-secondary/50 text-foreground hover:bg-secondary transition-colors"
        >
          <ListMusic className="h-4 w-4" aria-hidden />
        </button>
      </div>

      {/* Cover art */}
      <div className="flex flex-1 flex-col items-center justify-center px-8 gap-8">
        <div className={cn(
          'relative aspect-square w-full max-w-xs rounded-2xl overflow-hidden shadow-2xl',
          'ring-1 ring-white/10',
          isPlaying && 'shadow-primary/20',
        )}>
          {currentTrack.coverUrl ? (
            <img
              src={currentTrack.coverUrl}
              alt={currentTrack.title}
              className={cn(
                'h-full w-full object-cover transition-transform duration-700',
                isPlaying && 'scale-105',
              )}
            />
          ) : (
            <div className="h-full w-full bg-secondary flex items-center justify-center">
              <ListMusic className="h-24 w-24 text-muted-foreground/20" aria-hidden />
            </div>
          )}
          {isLoading && (
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
              <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
            </div>
          )}
        </div>

        {/* Track info + like */}
        <div className="w-full max-w-xs">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <Link
                href={ROUTES.TRACK(currentTrack.id)}
                onClick={onClose}
                className="block text-xl font-bold text-foreground truncate hover:underline"
              >
                {currentTrack.title}
              </Link>
              <Link
                href={ROUTES.ARTIST(currentTrack.artist.id)}
                onClick={onClose}
                className="block text-sm text-muted-foreground hover:text-foreground hover:underline truncate mt-0.5"
              >
                {currentTrack.artist.stageName}
              </Link>
            </div>
            <button
              type="button"
              onClick={() => addFav.mutate(currentTrack.id)}
              aria-label="Like track"
              className="shrink-0 text-muted-foreground hover:text-primary transition-colors mt-1"
            >
              <Heart className="h-6 w-6" aria-hidden />
            </button>
          </div>

          {/* Seek bar */}
          <div className="mt-6">
            <div
              className="relative h-1.5 w-full cursor-pointer rounded-full bg-secondary/60 group"
              onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                seekTo(((e.clientX - rect.left) / rect.width) * durationSec);
              }}
              role="slider"
              aria-label="Seek"
              aria-valuemin={0}
              aria-valuemax={durationSec}
              aria-valuenow={progressSec}
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'ArrowRight') seekTo(Math.min(progressSec + 5, durationSec));
                if (e.key === 'ArrowLeft')  seekTo(Math.max(progressSec - 5, 0));
              }}
            >
              <div
                className="absolute inset-y-0 left-0 rounded-full bg-foreground"
                style={{ width: `${pct}%` }}
              />
              <div
                className="absolute top-1/2 -translate-y-1/2 h-4 w-4 rounded-full bg-foreground shadow opacity-0 group-hover:opacity-100 group-focus:opacity-100 transition-opacity"
                style={{ left: `calc(${pct}% - 8px)` }}
              />
            </div>
            <div className="flex justify-between mt-2">
              <span className="text-[11px] tabular-nums text-muted-foreground">
                {formatDuration(progressSec)}
              </span>
              <span className="text-[11px] tabular-nums text-muted-foreground">
                -{formatDuration(Math.max(0, durationSec - progressSec))}
              </span>
            </div>
          </div>

          {/* Transport controls */}
          <div className="flex items-center justify-between mt-6">
            <button
              type="button"
              onClick={toggleShuffle}
              aria-label="Shuffle"
              aria-pressed={isShuffled}
              className={cn(
                'text-muted-foreground hover:text-foreground transition-colors',
                isShuffled && 'text-primary',
              )}
            >
              <Shuffle className="h-5 w-5" aria-hidden />
            </button>

            <button
              type="button"
              onClick={playPrevious}
              aria-label="Previous"
              className="text-foreground/80 hover:text-foreground transition-colors"
            >
              <SkipBack className="h-7 w-7" aria-hidden />
            </button>

            <button
              type="button"
              onClick={togglePlay}
              aria-label={isPlaying ? 'Pause' : 'Play'}
              className="flex h-16 w-16 items-center justify-center rounded-full bg-foreground text-background shadow-lg hover:scale-105 active:scale-95 transition-transform"
            >
              {isPlaying
                ? <Pause className="h-7 w-7 fill-current" aria-hidden />
                : <Play className="h-7 w-7 fill-current translate-x-0.5" aria-hidden />}
            </button>

            <button
              type="button"
              onClick={playNext}
              aria-label="Next"
              className="text-foreground/80 hover:text-foreground transition-colors"
            >
              <SkipForward className="h-7 w-7" aria-hidden />
            </button>

            <button
              type="button"
              onClick={cycleRepeat}
              aria-label={`Repeat: ${repeatMode}`}
              className={cn(
                'text-muted-foreground hover:text-foreground transition-colors',
                repeatMode !== 'none' && 'text-primary',
              )}
            >
              {repeatMode === 'one'
                ? <Repeat1 className="h-5 w-5" aria-hidden />
                : <Repeat className="h-5 w-5" aria-hidden />}
            </button>
          </div>

          {/* Volume */}
          <div className="flex items-center gap-3 mt-6">
            <button
              type="button"
              onClick={toggleMute}
              aria-label={isMuted ? 'Unmute' : 'Mute'}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              {isMuted || volume === 0
                ? <VolumeX className="h-4 w-4" aria-hidden />
                : <Volume2 className="h-4 w-4" aria-hidden />}
            </button>
            <div
              className="flex-1 h-1 rounded-full bg-secondary/60 cursor-pointer"
              onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                setVolume(Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width)));
              }}
            >
              <div
                className="h-full rounded-full bg-foreground/60"
                style={{ width: `${(isMuted ? 0 : volume) * 100}%` }}
              />
            </div>
            <Volume2 className="h-4 w-4 text-muted-foreground" aria-hidden />
          </div>
        </div>
      </div>

      {/* Bottom safe area spacer */}
      <div className="h-safe-bottom h-8" />
    </div>
  );
}