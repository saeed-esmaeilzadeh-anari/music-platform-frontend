'use client';

import { useCallback, useRef, useEffect } from 'react';
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
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDuration } from '@/lib/utils';
import { usePlayerStore } from '@/stores/player.store';
import { useAuthStore } from '@/stores/auth.store';
import { useAddFavorite, useRemoveFavorite } from '@/hooks/use-catalog';
import { useRegisterPlay } from '@/hooks/use-tracks';
import { PLAY_REGISTER_THRESHOLD_SEC, PLAYER_PROGRESS_INTERVAL_MS } from '@/lib/constants';
import { useUIStore } from '@/stores/ui.store';

// ─── Progress slider ──────────────────────────────────────────────────────────

function ProgressBar() {
  const { progressSec, durationSec, setProgress } = usePlayerStore();
  const progress = durationSec > 0 ? (progressSec / durationSec) * 100 : 0;

  return (
    <div className="flex items-center gap-2 w-full">
      <span className="text-[10px] tabular-nums text-muted-foreground w-8 text-right shrink-0">
        {formatDuration(progressSec)}
      </span>
      <div className="relative flex-1 group h-1">
        <div className="h-full rounded-full bg-secondary overflow-hidden">
          <div
            className="h-full rounded-full bg-primary transition-[width] duration-100"
            style={{ width: `${progress}%` }}
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

// ─── Volume control ───────────────────────────────────────────────────────────

function VolumeControl() {
  const { volume, isMuted, setVolume, toggleMute } = usePlayerStore();
  const displayVol = isMuted ? 0 : volume;

  return (
    <div className="hidden md:flex items-center gap-2">
      <button
        type="button"
        onClick={toggleMute}
        aria-label={isMuted ? 'Unmute' : 'Mute'}
        className="text-muted-foreground hover:text-foreground transition-colors"
      >
        {isMuted || volume === 0 ? (
          <VolumeX className="h-4 w-4" aria-hidden />
        ) : (
          <Volume2 className="h-4 w-4" aria-hidden />
        )}
      </button>
      <div className="relative w-20 group h-1">
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

// ─── Track info ───────────────────────────────────────────────────────────────

function NowPlayingInfo() {
  const { currentTrack } = usePlayerStore();
  const addFav = useAddFavorite();
  const removeFav = useRemoveFavorite();

  if (!currentTrack) {
    return (
      <div className="flex-1 min-w-0">
        <p className="text-xs text-muted-foreground/50 select-none">
          Nothing playing
        </p>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3 flex-1 min-w-0">
      {/* Cover */}
      <div className="h-10 w-10 shrink-0 rounded bg-secondary border border-border flex items-center justify-center overflow-hidden">
        {currentTrack.coverUrl ? (
          <img src={currentTrack.coverUrl} alt="" className="h-full w-full object-cover" />
        ) : (
          <ListMusic className="h-4 w-4 text-muted-foreground/40" aria-hidden />
        )}
      </div>
      {/* Title + artist */}
      <div className="min-w-0">
        <p className="truncate text-sm font-medium text-foreground leading-tight">
          {currentTrack.title}
        </p>
        <p className="truncate text-xs text-muted-foreground">
          {currentTrack.artist.stageName}
        </p>
      </div>
      {/* Favourite toggle */}
      <button
        type="button"
        onClick={() => addFav.mutate(currentTrack.id)}
        aria-label="Add to favourites"
        className="shrink-0 text-muted-foreground hover:text-primary transition-colors ml-1"
      >
        <Heart className="h-4 w-4" aria-hidden />
      </button>
    </div>
  );
}

// ─── PlayerBar ────────────────────────────────────────────────────────────────

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
    // toggleQueuePanel,
    progressSec,
  } = usePlayerStore();
  const { toggleQueuePanel: toggleQueue } = useUIStore() //as ReturnType<typeof useUIStore>;
  const { isAuthenticated } = useAuthStore();
  const registerPlay = useRegisterPlay();

  // Track whether we've already fired the play event for this track session
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

  const { toggleQueuePanel: uiToggleQueue } = useUIStore();

  return (
    <footer
      className={cn(
        'sticky bottom-0 z-30 border-t border-border bg-player-bg',
        'flex items-center gap-4 px-4 h-20',
      )}
      aria-label="Music player"
    >
      {/* Now playing */}
      <div className="flex-1 min-w-0 max-w-[260px]">
        <NowPlayingInfo />
      </div>

      {/* Centre controls + progress */}
      <div className="flex flex-col items-center gap-1.5 flex-1 max-w-md">
        {/* Transport buttons */}
        <div className="flex items-center gap-3">
          {/* Shuffle */}
          <button
            type="button"
            onClick={toggleShuffle}
            aria-label="Shuffle"
            aria-pressed={isShuffled}
            className={cn(
              'text-muted-foreground hover:text-foreground transition-colors',
              isShuffled && 'text-primary hover:text-primary',
            )}
          >
            <Shuffle className="h-4 w-4" aria-hidden />
          </button>

          {/* Previous */}
          <button
            type="button"
            onClick={playPrevious}
            aria-label="Previous track"
            disabled={!currentTrack}
            className="text-muted-foreground hover:text-foreground transition-colors disabled:opacity-30"
          >
            <SkipBack className="h-5 w-5" aria-hidden />
          </button>

          {/* Play / Pause */}
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
            {isPlaying ? (
              <Pause className="h-4 w-4 fill-current" aria-hidden />
            ) : (
              <Play className="h-4 w-4 fill-current translate-x-px" aria-hidden />
            )}
          </button>

          {/* Next */}
          <button
            type="button"
            onClick={playNext}
            aria-label="Next track"
            disabled={!currentTrack}
            className="text-muted-foreground hover:text-foreground transition-colors disabled:opacity-30"
          >
            <SkipForward className="h-5 w-5" aria-hidden />
          </button>

          {/* Repeat */}
          <button
            type="button"
            onClick={cycleRepeat}
            aria-label={`Repeat mode: ${repeatMode}`}
            className={cn(
              'text-muted-foreground hover:text-foreground transition-colors',
              repeatMode !== 'none' && 'text-primary hover:text-primary',
            )}
          >
            {repeatMode === 'one' ? (
              <Repeat1 className="h-4 w-4" aria-hidden />
            ) : (
              <Repeat className="h-4 w-4" aria-hidden />
            )}
          </button>
        </div>

        {/* Progress bar */}
        <ProgressBar />
      </div>

      {/* Right controls */}
      <div className="flex items-center gap-3 flex-1 justify-end max-w-[200px]">
        <VolumeControl />
        <button
          type="button"
          onClick={uiToggleQueue}
          aria-label="Toggle queue"
          className="hidden sm:flex text-muted-foreground hover:text-foreground transition-colors"
        >
          <ListMusic className="h-4 w-4" aria-hidden />
        </button>
      </div>
    </footer>
  );
}