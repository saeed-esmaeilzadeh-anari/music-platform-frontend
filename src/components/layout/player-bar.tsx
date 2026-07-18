'use client';

import { useCallback, useRef } from 'react';
import Link from 'next/link';
import {
  Play, Pause, SkipBack, SkipForward,
  Shuffle, Repeat, Repeat1,
  Volume, Volume1, Volume2, VolumeX,
  ListMusic, Heart, Maximize2, ChevronUp,
} from 'lucide-react';
import { cn, formatDuration } from '@/lib/utils';
import { usePlayerStore } from '@/stores/player.store';
import { useUIStore } from '@/stores/ui.store';
import { useAddFavorite } from '@/hooks/use-catalog';
import { ROUTES } from '@/lib/constants';

// ─── Seek bar ─────────────────────────────────────────────────────────────────

function SeekBar() {
  const { progressSec, durationSec, seekTo, isLoading } = usePlayerStore();
  const pct = durationSec > 0 ? (progressSec / durationSec) * 100 : 0;
  const trackRef = useRef<HTMLDivElement>(null);

  const handleClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!trackRef.current || durationSec === 0) return;
    const rect = trackRef.current.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    seekTo(ratio * durationSec);
  }, [durationSec, seekTo]);

  return (
    <div className="flex w-full items-center gap-2.5">
      <span className="w-9 shrink-0 text-right text-[10px] tabular-nums text-muted-foreground">
        {formatDuration(progressSec)}
      </span>

      {/* Track */}
      <div
        ref={trackRef}
        onClick={handleClick}
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
        className={cn(
          'group relative h-1 flex-1 cursor-pointer rounded-full bg-secondary',
          isLoading && 'animate-pulse',
        )}
      >
        {/* Fill */}
        <div
          className="pointer-events-none absolute inset-y-0 left-0 rounded-full bg-primary transition-[width] duration-75"
          style={{ width: `${pct}%` }}
        />
        {/* Thumb */}
        <div
          className="pointer-events-none absolute top-1/2 -translate-y-1/2 h-3 w-3 rounded-full bg-foreground opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
          style={{ left: `calc(${pct}% - 6px)` }}
        />
      </div>

      <span className="w-9 shrink-0 text-[10px] tabular-nums text-muted-foreground">
        {formatDuration(durationSec)}
      </span>
    </div>
  );
}

// ─── Volume control ───────────────────────────────────────────────────────────

function VolumeControl({ className }: { className?: string }) {
  const { volume, isMuted, setVolume, toggleMute } = usePlayerStore();
  const display = isMuted ? 0 : volume;

  const VolumeIcon = isMuted || volume === 0 ? VolumeX
    : volume < 0.3 ? Volume
    : volume < 0.7 ? Volume1
    : Volume2;

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <button
        type="button"
        onClick={toggleMute}
        aria-label={isMuted ? 'Unmute' : 'Mute'}
        className="shrink-0 text-muted-foreground hover:text-foreground transition-colors"
      >
        <VolumeIcon className="h-4 w-4" aria-hidden />
      </button>

      <div className="group relative h-1 w-20 cursor-pointer rounded-full bg-secondary"
        onClick={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          const vol = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
          setVolume(vol);
        }}
        role="slider"
        aria-label="Volume"
        aria-valuemin={0}
        aria-valuemax={1}
        aria-valuenow={display}
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'ArrowRight') setVolume(Math.min(display + 0.05, 1));
          if (e.key === 'ArrowLeft')  setVolume(Math.max(display - 0.05, 0));
        }}
      >
        <div
          className="pointer-events-none absolute inset-y-0 left-0 rounded-full bg-muted-foreground group-hover:bg-primary transition-colors"
          style={{ width: `${display * 100}%` }}
        />
        <div
          className="pointer-events-none absolute top-1/2 -translate-y-1/2 h-3 w-3 rounded-full bg-foreground opacity-0 group-hover:opacity-100 transition-opacity"
          style={{ left: `calc(${display * 100}% - 6px)` }}
        />
      </div>
    </div>
  );
}

// ─── Now playing info ─────────────────────────────────────────────────────────

function NowPlayingInfo() {
  const { currentTrack, isLoading } = usePlayerStore();
  const addFav = useAddFavorite();

  if (!currentTrack) {
    return (
      <p className="text-xs text-muted-foreground/40 select-none">Nothing playing</p>
    );
  }

  return (
    <div className="flex items-center gap-3 min-w-0">
      {/* Cover */}
      <Link href={ROUTES.TRACK(currentTrack.id)} className="relative shrink-0">
        <div className="h-10 w-10 rounded overflow-hidden bg-secondary border border-border">
          {currentTrack.coverUrl
            ? <img src={currentTrack.coverUrl} alt="" className="h-full w-full object-cover" />
            : <ListMusic className="h-4 w-4 m-auto mt-3 text-muted-foreground/30" aria-hidden />}
        </div>
        {isLoading && (
          <div className="absolute inset-0 rounded bg-black/40 flex items-center justify-center">
            <div className="h-3 w-3 rounded-full border-2 border-primary border-t-transparent animate-spin" />
          </div>
        )}
      </Link>

      {/* Title + artist */}
      <div className="min-w-0">
        <Link
          href={ROUTES.TRACK(currentTrack.id)}
          className="block truncate text-sm font-medium text-foreground hover:underline leading-tight"
        >
          {currentTrack.title}
        </Link>
        <Link
          href={ROUTES.ARTIST(currentTrack.artist.id)}
          className="block truncate text-xs text-muted-foreground hover:text-foreground hover:underline"
        >
          {currentTrack.artist.stageName}
        </Link>
      </div>

      {/* Like */}
      <button
        type="button"
        onClick={() => addFav.mutate(currentTrack.id)}
        aria-label="Like track"
        className="ml-1 shrink-0 text-muted-foreground hover:text-primary transition-colors"
      >
        <Heart className="h-3.5 w-3.5" aria-hidden />
      </button>
    </div>
  );
}

// ─── Transport controls ───────────────────────────────────────────────────────

function TransportControls() {
  const {
    currentTrack, isPlaying, repeatMode, isShuffled,
    togglePlay, playNext, playPrevious, cycleRepeat, toggleShuffle,
  } = usePlayerStore();

  return (
    <div className="flex items-center gap-3">
      <button
        type="button"
        onClick={toggleShuffle}
        aria-label="Shuffle"
        aria-pressed={isShuffled}
        className={cn(
          'relative text-muted-foreground hover:text-foreground transition-colors',
          isShuffled && 'text-primary hover:text-primary',
        )}
      >
        <Shuffle className="h-4 w-4" aria-hidden />
        {isShuffled && <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 h-0.5 w-0.5 rounded-full bg-primary" aria-hidden />}
      </button>

      <button
        type="button"
        onClick={playPrevious}
        aria-label="Previous track"
        disabled={!currentTrack}
        className="text-muted-foreground hover:text-foreground transition-colors disabled:opacity-30"
      >
        <SkipBack className="h-5 w-5" aria-hidden />
      </button>

      <button
        type="button"
        onClick={togglePlay}
        aria-label={isPlaying ? 'Pause' : 'Play'}
        disabled={!currentTrack}
        className={cn(
          'flex h-9 w-9 items-center justify-center rounded-full',
          'bg-foreground text-background',
          'hover:scale-105 active:scale-95 transition-transform duration-100',
          'disabled:opacity-30 disabled:hover:scale-100',
        )}
      >
        {isPlaying
          ? <Pause className="h-4 w-4 fill-current" aria-hidden />
          : <Play className="h-4 w-4 fill-current translate-x-px" aria-hidden />}
      </button>

      <button
        type="button"
        onClick={playNext}
        aria-label="Next track"
        disabled={!currentTrack}
        className="text-muted-foreground hover:text-foreground transition-colors disabled:opacity-30"
      >
        <SkipForward className="h-5 w-5" aria-hidden />
      </button>

      <button
        type="button"
        onClick={cycleRepeat}
        aria-label={`Repeat: ${repeatMode}`}
        className={cn(
          'relative text-muted-foreground hover:text-foreground transition-colors',
          repeatMode !== 'none' && 'text-primary hover:text-primary',
        )}
      >
        {repeatMode === 'one'
          ? <Repeat1 className="h-4 w-4" aria-hidden />
          : <Repeat className="h-4 w-4" aria-hidden />}
        {repeatMode !== 'none' && <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 h-0.5 w-0.5 rounded-full bg-primary" aria-hidden />}
      </button>
    </div>
  );
}

// ─── PlayerBar ────────────────────────────────────────────────────────────────

export function PlayerBar() {
  const { toggleQueuePanel } = useUIStore();
  const { currentTrack } = usePlayerStore();

  return (
    <footer
      className="relative z-30 border-t border-border bg-player-bg"
      aria-label="Music player"
    >
      {/* Mobile strip (< md) */}
      <MobilePlayerStrip />

      {/* Desktop player (≥ md) */}
      <div className="hidden md:grid md:grid-cols-3 items-center h-20 px-4 gap-4">
        {/* Left — now playing */}
        <div className="min-w-0">
          <NowPlayingInfo />
        </div>

        {/* Center — transport + seek */}
        <div className="flex flex-col items-center gap-1.5">
          <TransportControls />
          <SeekBar />
        </div>

        {/* Right — volume + queue */}
        <div className="flex items-center justify-end gap-3">
          <VolumeControl />
          <button
            type="button"
            onClick={toggleQueuePanel}
            aria-label="Toggle queue"
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <ListMusic className="h-4 w-4" aria-hidden />
          </button>
        </div>
      </div>
    </footer>
  );
}

// ─── Mobile player strip ──────────────────────────────────────────────────────

function MobilePlayerStrip() {
  const { currentTrack, isPlaying, togglePlay, playNext, isLoading } = usePlayerStore();
  const { toggleQueuePanel } = useUIStore();

  if (!currentTrack) return null;

  return (
    <div className="md:hidden">
      {/* Thin seek progress bar at top of mobile strip */}
      <MobileSeekStrip />

      <div className="flex items-center gap-3 px-4 py-2.5">
        {/* Cover */}
        <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded bg-secondary border border-border">
          {currentTrack.coverUrl
            ? <img src={currentTrack.coverUrl} alt="" className="h-full w-full object-cover" />
            : <ListMusic className="h-4 w-4 m-auto mt-3 text-muted-foreground/30" />}
          {isLoading && (
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
              <div className="h-3 w-3 rounded-full border-2 border-primary border-t-transparent animate-spin" />
            </div>
          )}
        </div>

        {/* Title */}
        <div className="flex-1 min-w-0">
          <p className="truncate text-sm font-medium text-foreground">{currentTrack.title}</p>
          <p className="truncate text-xs text-muted-foreground">{currentTrack.artist.stageName}</p>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-1">
          <button type="button" onClick={togglePlay}
            aria-label={isPlaying ? 'Pause' : 'Play'}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-foreground text-background hover:scale-105 active:scale-95 transition-transform">
            {isPlaying
              ? <Pause className="h-4 w-4 fill-current" />
              : <Play className="h-4 w-4 fill-current translate-x-px" />}
          </button>
          <button type="button" onClick={playNext} aria-label="Next"
            className="h-9 w-9 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors">
            <SkipForward className="h-5 w-5" />
          </button>
          <button type="button" onClick={toggleQueuePanel} aria-label="Queue"
            className="h-9 w-9 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors">
            <ListMusic className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

function MobileSeekStrip() {
  const { progressSec, durationSec, seekTo } = usePlayerStore();
  const pct = durationSec > 0 ? (progressSec / durationSec) * 100 : 0;
  return (
    <div className="h-0.5 w-full bg-secondary cursor-pointer"
      onClick={(e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        seekTo(((e.clientX - rect.left) / rect.width) * durationSec);
      }}>
      <div className="h-full bg-primary transition-[width] duration-75" style={{ width: `${pct}%` }} />
    </div>
  );
}
