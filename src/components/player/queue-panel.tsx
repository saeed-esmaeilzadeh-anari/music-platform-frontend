'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  X, GripVertical, Trash2, ListMusic,
  History, Play, Pause, ChevronRight,
} from 'lucide-react';
import { cn, formatDuration } from '@/lib/utils/index';
import { usePlayerStore } from '@/stores/player.store';
import { useUIStore } from '@/stores/ui.store';
import { ROUTES } from '@/lib/constants';
import type { TrackResponse } from '@/types';

// ─── Tab type ─────────────────────────────────────────────────────────────────

type QueueTab = 'queue' | 'recent';

// ─── Queue track row ──────────────────────────────────────────────────────────

interface QueueRowProps {
  track: TrackResponse;
  index: number;
  isCurrent: boolean;
  isPlaying: boolean;
  onPlay: () => void;
  onRemove: () => void;
  draggable?: boolean;
}

function QueueRow({ track, index, isCurrent, isPlaying, onPlay, onRemove }: QueueRowProps) {
  return (
    <div
      className={cn(
        'group flex items-center gap-2 rounded-md px-2 py-2 transition-colors',
        isCurrent
          ? 'bg-primary/10 border border-primary/20'
          : 'hover:bg-secondary',
      )}
    >
      {/* Drag handle */}
      <GripVertical
        className="h-4 w-4 shrink-0 text-muted-foreground/30 cursor-grab group-hover:text-muted-foreground/60 transition-colors"
        aria-hidden
      />

      {/* Play button / index */}
      <button
        type="button"
        onClick={onPlay}
        aria-label={isCurrent && isPlaying ? 'Pause' : `Play ${track.title}`}
        className="flex h-7 w-7 shrink-0 items-center justify-center"
      >
        {isCurrent && isPlaying ? (
          <span className="flex items-end gap-[2px] h-4" aria-hidden>
            {[1, 1.6, 1.2].map((h, i) => (
              <span
                key={i}
                className="w-[3px] rounded-full bg-primary"
                style={{
                  height: `${h * 10}px`,
                  animation: `wave-${i + 1} ${1.1 + i * 0.2}s ease-in-out infinite`,
                }}
              />
            ))}
          </span>
        ) : (
          <>
            <span className={cn('text-xs tabular-nums text-muted-foreground group-hover:hidden', isCurrent && 'hidden')}>
              {index + 1}
            </span>
            <Play
              className={cn(
                'h-3.5 w-3.5 fill-current text-foreground translate-x-px',
                isCurrent ? 'text-primary' : 'hidden group-hover:block',
              )}
              aria-hidden
            />
          </>
        )}
      </button>

      {/* Cover */}
      <div className="h-8 w-8 shrink-0 rounded overflow-hidden bg-secondary border border-border">
        {track.coverUrl
          ? <img src={track.coverUrl} alt="" className="h-full w-full object-cover" />
          : <ListMusic className="h-3 w-3 m-auto mt-2.5 text-muted-foreground/30" />}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className={cn('truncate text-xs font-medium leading-tight', isCurrent && 'text-primary')}>
          {track.title}
        </p>
        <p className="truncate text-[10px] text-muted-foreground">
          {track.artist.stageName}
        </p>
      </div>

      {/* Duration */}
      <span className="text-[10px] tabular-nums text-muted-foreground shrink-0 mr-1">
        {formatDuration(track.durationSec)}
      </span>

      {/* Remove */}
      <button
        type="button"
        onClick={onRemove}
        aria-label="Remove from queue"
        className="shrink-0 text-muted-foreground hover:text-destructive transition-colors opacity-0 group-hover:opacity-100"
      >
        <Trash2 className="h-3.5 w-3.5" aria-hidden />
      </button>
    </div>
  );
}

// ─── Recently played row ──────────────────────────────────────────────────────

function RecentRow({ track, onPlay }: { track: TrackResponse; onPlay: () => void }) {
  return (
    <div className="group flex items-center gap-2 rounded-md px-2 py-2 hover:bg-secondary transition-colors">
      <button type="button" onClick={onPlay} aria-label={`Play ${track.title}`}
        className="flex h-7 w-7 shrink-0 items-center justify-center">
        <Play className="h-3.5 w-3.5 fill-current text-muted-foreground group-hover:text-foreground translate-x-px" />
      </button>

      <div className="h-8 w-8 shrink-0 rounded overflow-hidden bg-secondary border border-border">
        {track.coverUrl
          ? <img src={track.coverUrl} alt="" className="h-full w-full object-cover" />
          : <ListMusic className="h-3 w-3 m-auto mt-2.5 text-muted-foreground/30" />}
      </div>

      <div className="flex-1 min-w-0">
        <Link href={ROUTES.TRACK(track.id)} className="block truncate text-xs font-medium hover:underline">
          {track.title}
        </Link>
        <Link href={ROUTES.ARTIST(track.artist.id)} className="block truncate text-[10px] text-muted-foreground hover:text-foreground hover:underline">
          {track.artist.stageName}
        </Link>
      </div>

      <span className="text-[10px] tabular-nums text-muted-foreground shrink-0">
        {formatDuration(track.durationSec)}
      </span>
    </div>
  );
}

// ─── QueuePanel ──────────────────────────────────────────────────────────────

export function QueuePanel() {
  const { queuePanelOpen, toggleQueuePanel } = useUIStore();
  const {
    queue, queueIndex, currentTrack, isPlaying,
    recentlyPlayed, play, pause, resume,
    removeFromQueue, clearQueue, clearRecentlyPlayed,
  } = usePlayerStore();
  const [tab, setTab] = useState<QueueTab>('queue');

  if (!queuePanelOpen) return null;

  const handlePlayQueueItem = (track: TrackResponse, index: number) => {
    if (currentTrack?.id === track.id) {
      isPlaying ? pause() : resume();
    } else {
      play(track, queue);
    }
  };

  return (
    <>
      {/* Backdrop (mobile) */}
      <div
        className="fixed inset-0 z-40 bg-black/50 lg:hidden"
        onClick={toggleQueuePanel}
        aria-hidden
      />

      {/* Panel */}
      <aside
        role="complementary"
        aria-label="Queue and recently played"
        className={cn(
          'fixed right-0 top-0 bottom-0 z-50 flex w-80 flex-col',
          'bg-card border-l border-border shadow-2xl',
          'animate-slide-in-right',
          // On desktop, push content inward rather than overlapping
          'lg:relative lg:w-72 lg:shrink-0 lg:shadow-none lg:animate-none',
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-4 py-3 shrink-0">
          <div className="flex gap-1">
            <TabButton active={tab === 'queue'} onClick={() => setTab('queue')}>
              <ListMusic className="h-3.5 w-3.5" />
              Queue
              {queue.length > 0 && (
                <span className="ml-1 rounded-full bg-primary/20 px-1.5 py-0.5 text-[9px] font-semibold text-primary">
                  {queue.length}
                </span>
              )}
            </TabButton>
            <TabButton active={tab === 'recent'} onClick={() => setTab('recent')}>
              <History className="h-3.5 w-3.5" />
              Recent
            </TabButton>
          </div>

          <button
            type="button"
            onClick={toggleQueuePanel}
            aria-label="Close queue"
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="h-4 w-4" aria-hidden />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {/* ── Queue tab ── */}
          {tab === 'queue' && (
            <div className="p-2">
              {/* Now playing */}
              {currentTrack && (
                <div className="mb-3">
                  <p className="px-2 py-1.5 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60">
                    Now playing
                  </p>
                  <div className="flex items-center gap-2 rounded-md bg-primary/10 border border-primary/20 px-2 py-2">
                    <div className="flex items-end gap-[2px] h-4 w-7 shrink-0 justify-center" aria-hidden>
                      {[1, 1.6, 1.2].map((h, i) => (
                        <span
                          key={i}
                          className={cn('w-[3px] rounded-full bg-primary',
                            isPlaying
                              ? undefined
                              : 'opacity-40'
                          )}
                          style={{
                            height: `${h * 10}px`,
                            animation: isPlaying
                              ? `wave-${i + 1} ${1.1 + i * 0.2}s ease-in-out infinite`
                              : 'none',
                          }}
                        />
                      ))}
                    </div>
                    <div className="h-8 w-8 shrink-0 rounded overflow-hidden bg-secondary border border-border">
                      {currentTrack.coverUrl
                        ? <img src={currentTrack.coverUrl} alt="" className="h-full w-full object-cover" />
                        : <ListMusic className="h-3 w-3 m-auto mt-2.5 text-muted-foreground/30" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="truncate text-xs font-semibold text-primary">{currentTrack.title}</p>
                      <p className="truncate text-[10px] text-muted-foreground">{currentTrack.artist.stageName}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Up next */}
              {queue.length > 0 && (
                <>
                  <div className="flex items-center justify-between px-2 py-1.5">
                    <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60">
                      Up next ({queue.length})
                    </p>
                    <button
                      type="button"
                      onClick={clearQueue}
                      className="text-[10px] text-muted-foreground hover:text-destructive transition-colors"
                    >
                      Clear
                    </button>
                  </div>

                  <div className="space-y-0.5">
                    {queue.map((track, i) => (
                      <QueueRow
                        key={`${track.id}-${i}`}
                        track={track}
                        index={i}
                        isCurrent={i === queueIndex}
                        isPlaying={isPlaying && i === queueIndex}
                        onPlay={() => handlePlayQueueItem(track, i)}
                        onRemove={() => removeFromQueue(i)}
                      />
                    ))}
                  </div>
                </>
              )}

              {queue.length === 0 && !currentTrack && (
                <div className="flex flex-col items-center gap-3 py-16 text-center">
                  <ListMusic className="h-10 w-10 text-muted-foreground/20" aria-hidden />
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Queue is empty</p>
                    <p className="mt-1 text-xs text-muted-foreground/60">
                      Start playing a track to add it here
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── Recent tab ── */}
          {tab === 'recent' && (
            <div className="p-2">
              {recentlyPlayed.length > 0 && (
                <div className="flex items-center justify-between px-2 py-1.5 mb-1">
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60">
                    Recently played
                  </p>
                  <button
                    type="button"
                    onClick={clearRecentlyPlayed}
                    className="text-[10px] text-muted-foreground hover:text-destructive transition-colors"
                  >
                    Clear
                  </button>
                </div>
              )}

              {recentlyPlayed.length > 0 ? (
                <div className="space-y-0.5">
                  {recentlyPlayed.map((track) => (
                    <RecentRow
                      key={track.id}
                      track={track}
                      onPlay={() => play(track, [track])}
                    />
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center gap-3 py-16 text-center">
                  <History className="h-10 w-10 text-muted-foreground/20" aria-hidden />
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">No recent plays</p>
                    <p className="mt-1 text-xs text-muted-foreground/60">
                      Tracks you listen to will appear here
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </aside>
    </>
  );
}

// ─── Tab button ───────────────────────────────────────────────────────────────

function TabButton({
  active, onClick, children,
}: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors',
        active
          ? 'bg-secondary text-foreground'
          : 'text-muted-foreground hover:text-foreground',
      )}
    >
      {children}
    </button>
  );
}