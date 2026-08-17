"use client";

import { useRef, useCallback } from "react";
import Link from "next/link";
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Shuffle,
  Repeat,
  Repeat1,
  Volume1,
  Volume2,
  VolumeX,
  ListMusic,
  Heart,
} from "lucide-react";
import { cn, formatDuration } from "@/lib/utils";
import { usePlayerStore } from "@/stores/player.store";
import {
  usePlayerProgress,
  usePlayerVolume,
  usePlayerTransport,
} from "@/hooks/use-player";
import { useUIStore } from "@/stores/ui.store";

// ─── Seek bar ─────────────────────────────────────────────────────────────────

function SeekBar() {
  const { progressSec, durationSec, seekTo, pct } = usePlayerProgress();
  const trackRef = useRef<HTMLDivElement>(null);

  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      if (!trackRef.current || !durationSec) return;
      const rect = trackRef.current.getBoundingClientRect();
      const ratio = Math.max(
        0,
        Math.min(1, (e.clientX - rect.left) / rect.width)
      );
      seekTo(ratio * durationSec);
    },
    [durationSec, seekTo]
  );

  return (
    <div className="flex w-full items-center gap-2.5">
      <span className="w-9 shrink-0 text-right text-[10px] tabular-nums text-muted-foreground">
        {formatDuration(progressSec)}
      </span>
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
          if (e.key === "ArrowRight")
            seekTo(Math.min(progressSec + 5, durationSec));
          if (e.key === "ArrowLeft") seekTo(Math.max(progressSec - 5, 0));
        }}
        className="group relative h-1 flex-1 cursor-pointer rounded-full bg-secondary"
      >
        <div
          className="pointer-events-none absolute inset-y-0 left-0 rounded-full bg-primary transition-[width] duration-75"
          style={{ width: `${pct}%` }}
        />
        <div
          className="pointer-events-none absolute top-1/2 -translate-y-1/2 h-3 w-3 rounded-full bg-foreground shadow opacity-0 group-hover:opacity-100 transition-opacity"
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
  const { volume, isMuted, setVolume, toggleMute, effective } =
    usePlayerVolume();
  const VolumeIcon =
    isMuted || volume === 0 ? VolumeX : volume < 0.5 ? Volume1 : Volume2;

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <button
        type="button"
        onClick={toggleMute}
        aria-label={isMuted ? "Unmute" : "Mute"}
        className="text-muted-foreground hover:text-foreground transition-colors shrink-0"
      >
        <VolumeIcon className="h-4 w-4" aria-hidden />
      </button>
      <div
        className="group relative h-1 w-20 cursor-pointer rounded-full bg-secondary"
        role="slider"
        aria-label="Volume"
        aria-valuemin={0}
        aria-valuemax={1}
        aria-valuenow={effective}
        tabIndex={0}
        onClick={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          setVolume(
            Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width))
          );
        }}
        onKeyDown={(e) => {
          if (e.key === "ArrowRight") setVolume(Math.min(effective + 0.05, 1));
          if (e.key === "ArrowLeft") setVolume(Math.max(effective - 0.05, 0));
        }}
      >
        <div
          className="pointer-events-none absolute inset-y-0 left-0 rounded-full bg-muted-foreground group-hover:bg-primary transition-colors"
          style={{ width: `${effective * 100}%` }}
        />
        <div
          className="pointer-events-none absolute top-1/2 -translate-y-1/2 h-3 w-3 rounded-full bg-foreground opacity-0 group-hover:opacity-100 transition-opacity"
          style={{ left: `calc(${effective * 100}% - 6px)` }}
        />
      </div>
    </div>
  );
}

// ─── Now playing info ──────────────────────────────────────────────────────────

function NowPlayingInfo() {
  // const { currentTrack, isLoading } = usePlayerStore(s => ({
  //   currentTrack: s.currentTrack,
  //   isLoading:    s.isLoading,
  // }));

  const currentTrack = usePlayerStore((s) => s.currentTrack);
  const isLoading = usePlayerStore((s) => s.isLoading);

  if (!currentTrack) {
    return (
      <p className="text-xs text-muted-foreground/40 select-none">
        Nothing playing
      </p>
    );
  }

  return (
    <div className="flex items-center gap-3 min-w-0">
      {/* Cover */}
      <Link href={`/track/${currentTrack.id}`} className="relative shrink-0">
        <div className="h-10 w-10 overflow-hidden rounded bg-secondary border border-border">
          {currentTrack.coverUrl ? (
            <img
              src={currentTrack.coverUrl}
              alt=""
              className="h-full w-full object-cover"
            />
          ) : (
            <ListMusic className="h-4 w-4 m-auto mt-3 text-muted-foreground/30" />
          )}
        </div>
        {isLoading && (
          <div className="absolute inset-0 rounded bg-black/50 flex items-center justify-center">
            <div className="h-3 w-3 rounded-full border-2 border-primary border-t-transparent animate-spin" />
          </div>
        )}
      </Link>
      {/* Meta */}
      <div className="min-w-0">
        <Link
          href={`/track/${currentTrack.id}`}
          className="block truncate text-sm font-medium text-foreground hover:underline leading-tight"
        >
          {currentTrack.title}
        </Link>
        <Link
          href={`/artist/${currentTrack.artist.id}`}
          className="block truncate text-xs text-muted-foreground hover:text-foreground hover:underline"
        >
          {currentTrack.artist.stageName}
        </Link>
      </div>
      {/* Like */}
      <button
        type="button"
        aria-label="Like track"
        className="ml-1 shrink-0 text-muted-foreground hover:text-primary transition-colors"
      >
        <Heart className="h-3.5 w-3.5" aria-hidden />
      </button>
    </div>
  );
}

// ─── Transport controls ────────────────────────────────────────────────────────

function TransportControls() {
  //   const { currentTrack, isPlaying, repeatMode, isShuffled } = usePlayerStore(
  //     (s) => ({
  //       currentTrack: s.currentTrack,
  //       isPlaying: s.isPlaying,
  //       repeatMode: s.repeatMode,
  //       isShuffled: s.isShuffled,
  //     })
  //   );

  const currentTrack = usePlayerStore((s) => s.currentTrack);
  const isPlaying = usePlayerStore((s) => s.isPlaying);
  const repeatMode = usePlayerStore((s) => s.repeatMode);
  const isShuffled = usePlayerStore((s) => s.isShuffled);

  const { togglePlay, playNext, playPrevious, cycleRepeat, toggleShuffle } =
    usePlayerTransport();

  return (
    <div className="flex items-center gap-3">
      {/* Shuffle */}
      <button
        type="button"
        onClick={toggleShuffle}
        aria-label="Shuffle"
        aria-pressed={isShuffled}
        className={cn(
          "relative text-muted-foreground hover:text-foreground transition-colors",
          isShuffled && "text-primary hover:text-primary"
        )}
      >
        <Shuffle className="h-4 w-4" />
        {isShuffled && (
          <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 h-0.5 w-0.5 rounded-full bg-primary" />
        )}
      </button>
      {/* Previous */}
      <button
        type="button"
        onClick={playPrevious}
        aria-label="Previous"
        disabled={!currentTrack}
        className="text-muted-foreground hover:text-foreground transition-colors disabled:opacity-30"
      >
        <SkipBack className="h-5 w-5" />
      </button>
      {/* Play / Pause */}
      <button
        type="button"
        onClick={togglePlay}
        aria-label={isPlaying ? "Pause" : "Play"}
        disabled={!currentTrack}
        className="flex h-9 w-9 items-center justify-center rounded-full bg-foreground text-background hover:scale-105 active:scale-95 transition-transform disabled:opacity-30 disabled:hover:scale-100"
      >
        {isPlaying ? (
          <Pause className="h-4 w-4 fill-current" />
        ) : (
          <Play className="h-4 w-4 fill-current translate-x-px" />
        )}
      </button>
      {/* Next */}
      <button
        type="button"
        onClick={playNext}
        aria-label="Next"
        disabled={!currentTrack}
        className="text-muted-foreground hover:text-foreground transition-colors disabled:opacity-30"
      >
        <SkipForward className="h-5 w-5" />
      </button>
      {/* Repeat */}
      <button
        type="button"
        onClick={cycleRepeat}
        aria-label={`Repeat: ${repeatMode}`}
        className={cn(
          "relative text-muted-foreground hover:text-foreground transition-colors",
          repeatMode !== "none" && "text-primary hover:text-primary"
        )}
      >
        {repeatMode === "one" ? (
          <Repeat1 className="h-4 w-4" />
        ) : (
          <Repeat className="h-4 w-4" />
        )}
        {repeatMode !== "none" && (
          <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 h-0.5 w-0.5 rounded-full bg-primary" />
        )}
      </button>
    </div>
  );
}

// ─── Mobile seek strip ─────────────────────────────────────────────────────────

function MobileSeekStrip() {
  const { pct, durationSec, seekTo } = usePlayerProgress();
  return (
    <div
      className="h-0.5 w-full bg-secondary cursor-pointer"
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
  );
}

// ─── Mobile strip ─────────────────────────────────────────────────────────────

function MobilePlayerStrip() {
  // const { currentTrack, isPlaying, isLoading } = usePlayerStore((s) => ({
  //   currentTrack: s.currentTrack,
  //   isPlaying: s.isPlaying,
  //   isLoading: s.isLoading,
  // }));

  const currentTrack = usePlayerStore((s) => s.currentTrack);
  const isPlaying = usePlayerStore((s) => s.isPlaying);
  const isLoading = usePlayerStore((s) => s.isLoading);

  const { togglePlay, playNext } = usePlayerTransport();

  if (!currentTrack) return null;

  return (
    <div className="md:hidden">
      <MobileSeekStrip />
      <div className="flex items-center gap-3 px-4 py-2.5">
        {/* Cover */}
        <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded bg-secondary border border-border">
          {currentTrack.coverUrl && (
            <img
              src={currentTrack.coverUrl}
              alt=""
              className="h-full w-full object-cover"
            />
          )}
          {isLoading && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <div className="h-3 w-3 rounded-full border-2 border-primary border-t-transparent animate-spin" />
            </div>
          )}
        </div>
        {/* Info */}
        <div className="flex-1 min-w-0">
          <p className="truncate text-sm font-medium">{currentTrack.title}</p>
          <p className="truncate text-xs text-muted-foreground">
            {currentTrack.artist.stageName}
          </p>
        </div>
        {/* Controls */}
        <button
          type="button"
          onClick={togglePlay}
          aria-label={isPlaying ? "Pause" : "Play"}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-foreground text-background hover:scale-105 active:scale-95 transition-transform"
        >
          {isPlaying ? (
            <Pause className="h-4 w-4 fill-current" />
          ) : (
            <Play className="h-4 w-4 fill-current translate-x-px" />
          )}
        </button>
        <button
          type="button"
          onClick={playNext}
          aria-label="Next"
          className="h-9 w-9 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
        >
          <SkipForward className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}

// ─── PlayerBar ────────────────────────────────────────────────────────────────

export function PlayerBar() {
  const { toggleQueuePanel } = useUIStore(); // usePlayerStore(s => s.toggleQueuePanel ?? (() => {}));

  return (
    <footer
      className="relative z-30 shrink-0 border-t border-border"
      style={{ backgroundColor: "hsl(var(--player-bg, var(--background)))" }}
      aria-label="Music player"
    >
      {/* Sentinel for MiniPlayer IntersectionObserver */}
      <div
        id="player-bar-sentinel"
        className="absolute -top-px left-0 h-px w-full"
        aria-hidden
      />

      {/* Mobile strip */}
      <MobilePlayerStrip />

      {/* Desktop player */}
      <div className="hidden md:grid md:grid-cols-3 items-center h-20 px-4 gap-4">
        {/* Left — now playing */}
        <div className="min-w-0">
          <NowPlayingInfo />
        </div>

        {/* Centre — transport + seek */}
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
            <ListMusic className="h-4 w-4" />
          </button>
        </div>
      </div>
    </footer>
  );
}
