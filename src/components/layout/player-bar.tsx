"use client";

import { useRef, useEffect } from "react";
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Shuffle,
  Repeat,
  Repeat1,
  Volume2,
  VolumeX,
  ListMusic,
  Heart,
} from "lucide-react";
import { cn, formatDuration } from "@/lib/utils";
import { usePlayerStore } from "@/stores/player.store";
import { useUIStore } from "@/stores/ui.store";
import { useAuthStore } from "@/stores/auth.store";
import { useAddFavorite } from "@/hooks/use-catalog";
import { useRegisterPlay } from "@/hooks/use-tracks";
import { PLAY_REGISTER_THRESHOLD_SEC } from "@/lib/constants";

function ProgressBar() {
  const { progressSec, durationSec, setProgress } = usePlayerStore();
  const pct = durationSec > 0 ? (progressSec / durationSec) * 100 : 0;
  return (
    <div className="flex items-center gap-2 w-full">
      <span className="text-[10px] tabular-nums text-muted-foreground w-8 text-right shrink-0">
        {formatDuration(progressSec)}
      </span>
      <div className="relative flex-1 h-1 group">
        <div className="h-full rounded-full bg-secondary overflow-hidden">
          <div
            className="h-full rounded-full bg-primary transition-[width] duration-100"
            style={{ width: `${pct}%` }}
          />
        </div>
        <input
          type="range"
          min={0}
          max={durationSec || 100}
          value={progressSec}
          onChange={(e) => setProgress(Number(e.target.value))}
          aria-label="Seek"
          className="absolute inset-0 w-full opacity-0 cursor-pointer h-full"
        />
      </div>
      <span className="text-[10px] tabular-nums text-muted-foreground w-8 shrink-0">
        {formatDuration(durationSec)}
      </span>
    </div>
  );
}

function VolumeControl() {
  const { volume, isMuted, setVolume, toggleMute } = usePlayerStore();
  const displayVol = isMuted ? 0 : volume;
  return (
    <div className="hidden md:flex items-center gap-2">
      <button
        type="button"
        onClick={toggleMute}
        aria-label={isMuted ? "Unmute" : "Mute"}
        className="text-muted-foreground hover:text-foreground transition-colors"
      >
        {isMuted || volume === 0 ? (
          <VolumeX className="h-4 w-4" />
        ) : (
          <Volume2 className="h-4 w-4" />
        )}
      </button>
      <div className="relative w-20 h-1 group">
        <div className="h-full rounded-full bg-secondary overflow-hidden">
          <div
            className="h-full rounded-full bg-muted-foreground group-hover:bg-primary transition-colors"
            style={{ width: `${displayVol * 100}%` }}
          />
        </div>
        <input
          type="range"
          min={0}
          max={1}
          step={0.02}
          value={displayVol}
          onChange={(e) => setVolume(Number(e.target.value))}
          aria-label="Volume"
          className="absolute inset-0 w-full opacity-0 cursor-pointer h-full"
        />
      </div>
    </div>
  );
}

function NowPlayingInfo() {
  const { currentTrack } = usePlayerStore();
  const addFav = useAddFavorite();
  if (!currentTrack) {
    return (
      <p className="text-xs text-muted-foreground/40 select-none">
        Nothing playing
      </p>
    );
  }
  return (
    <div className="flex items-center gap-3 min-w-0">
      <div className="h-10 w-10 shrink-0 rounded bg-secondary border border-border flex items-center justify-center overflow-hidden">
        {currentTrack.coverUrl ? (
          <img
            src={currentTrack.coverUrl}
            alt=""
            className="h-full w-full object-cover"
          />
        ) : (
          <ListMusic className="h-4 w-4 text-muted-foreground/40" />
        )}
      </div>
      <div className="min-w-0">
        <p className="truncate text-sm font-medium text-foreground leading-tight">
          {currentTrack.title}
        </p>
        <p className="truncate text-xs text-muted-foreground">
          {currentTrack.artist.stageName}
        </p>
      </div>
      <button
        type="button"
        onClick={() => addFav.mutate(currentTrack.id)}
        aria-label="Add to favourites"
        className="shrink-0 text-muted-foreground hover:text-primary transition-colors ml-1"
      >
        <Heart className="h-4 w-4" />
      </button>
    </div>
  );
}

export function PlayerBar() {
  const {
    currentTrack,
    isPlaying,
    repeatMode,
    isShuffled,
    togglePlay,
    playNext,
    playPrevious,
    cycleRepeat,
    toggleShuffle,
    progressSec,
  } = usePlayerStore();
  const { toggleQueuePanel } = useUIStore();
  const { isAuthenticated } = useAuthStore();
  const registerPlay = useRegisterPlay();
  const hasRegisteredRef = useRef(false);

  useEffect(() => {
    hasRegisteredRef.current = false;
  }, [currentTrack?.id]);

  useEffect(() => {
    if (
      isAuthenticated &&
      currentTrack &&
      !hasRegisteredRef.current &&
      progressSec >= PLAY_REGISTER_THRESHOLD_SEC
    ) {
      hasRegisteredRef.current = true;
      registerPlay.mutate({ id: currentTrack.id, progressSec });
    }
  }, [progressSec, currentTrack, isAuthenticated]);

  return (
    <footer
      className="sticky bottom-0 z-30 border-t border-border bg-player-bg flex items-center gap-4 px-4 h-20"
      aria-label="Music player"
    >
      {/* Now playing */}
      <div className="flex-1 min-w-0 max-w-[260px]">
        <NowPlayingInfo />
      </div>

      {/* Controls */}
      <div className="flex flex-col items-center gap-1.5 flex-1 max-w-md">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={toggleShuffle}
            aria-label="Shuffle"
            aria-pressed={isShuffled}
            className={cn(
              "text-muted-foreground hover:text-foreground transition-colors",
              isShuffled && "text-primary"
            )}
          >
            <Shuffle className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={playPrevious}
            aria-label="Previous"
            disabled={!currentTrack}
            className="text-muted-foreground hover:text-foreground transition-colors disabled:opacity-30"
          >
            <SkipBack className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={togglePlay}
            aria-label={isPlaying ? "Pause" : "Play"}
            disabled={!currentTrack}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-foreground text-background hover:scale-105 active:scale-95 transition-transform disabled:opacity-30"
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
            disabled={!currentTrack}
            className="text-muted-foreground hover:text-foreground transition-colors disabled:opacity-30"
          >
            <SkipForward className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={cycleRepeat}
            aria-label={`Repeat: ${repeatMode}`}
            className={cn(
              "text-muted-foreground hover:text-foreground transition-colors",
              repeatMode !== "none" && "text-primary"
            )}
          >
            {repeatMode === "one" ? (
              <Repeat1 className="h-4 w-4" />
            ) : (
              <Repeat className="h-4 w-4" />
            )}
          </button>
        </div>
        <ProgressBar />
      </div>

      {/* Right */}
      <div className="flex items-center gap-3 flex-1 justify-end max-w-[200px]">
        <VolumeControl />
        <button
          type="button"
          onClick={toggleQueuePanel}
          aria-label="Toggle queue"
          className="hidden sm:flex text-muted-foreground hover:text-foreground transition-colors"
        >
          <ListMusic className="h-4 w-4" />
        </button>
      </div>
    </footer>
  );
}
