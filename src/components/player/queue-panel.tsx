'use client';

import { useState } from 'react';
import { X, ListMusic, History, Trash2, GripVertical } from 'lucide-react';
import { cn, formatDuration } from '@/lib/utils';
import { usePlayerStore } from '@/stores/player.store';
import type { TrackResponse } from '@/types';

// ─── Track row in queue ────────────────────────────────────────────────────────

function QueueRow({ track, index, isCurrent, isPlaying, onPlay, onRemove }: {
  track: TrackResponse; index: number; isCurrent: boolean; isPlaying: boolean;
  onPlay: () => void; onRemove: () => void;
}) {
  return (
    <div className={cn(
      'group flex items-center gap-2 rounded-md px-2 py-2 transition-colors',
      isCurrent ? 'bg-primary/10 border border-primary/20' : 'hover:bg-secondary',
    )}>
      <GripVertical className="h-4 w-4 shrink-0 text-muted-foreground/30 group-hover:text-muted-foreground/60 cursor-grab" aria-hidden />

      {/* Play indicator */}
      <button type="button" onClick={onPlay} aria-label={isCurrent && isPlaying ? 'Pause' : `Play ${track.title}`}
        className="flex h-7 w-7 shrink-0 items-center justify-center">
        {isCurrent && isPlaying ? (
          <span className="flex items-end gap-px h-4" aria-hidden>
            {[1.0, 1.6, 1.2].map((h, i) => (
              <span key={i} className="w-[3px] rounded-full bg-primary"
                style={{ height: `${h * 10}px`, animation: `wave-${i + 1} ${1.1 + i * 0.2}s ease-in-out infinite` }} />
            ))}
          </span>
        ) : (
          <>
            <span className={cn('text-xs tabular-nums text-muted-foreground', isCurrent && 'hidden', 'group-hover:hidden')}>{index + 1}</span>
            <span className={cn('text-xs translate-x-px text-foreground hidden', isCurrent ? 'block text-primary' : 'group-hover:block')}>▶</span>
          </>
        )}
      </button>

      {/* Cover */}
      <div className="h-8 w-8 shrink-0 overflow-hidden rounded bg-secondary border border-border">
        {track.coverUrl ? <img src={track.coverUrl} alt="" className="h-full w-full object-cover" /> : null}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className={cn('truncate text-xs font-medium', isCurrent && 'text-primary')}>{track.title}</p>
        <p className="truncate text-[10px] text-muted-foreground">{track.artist.stageName}</p>
      </div>

      <span className="text-[10px] text-muted-foreground tabular-nums shrink-0 mr-1">{formatDuration(track.durationSec)}</span>

      {/* Remove */}
      <button type="button" onClick={onRemove} aria-label="Remove from queue"
        className="shrink-0 text-muted-foreground hover:text-destructive transition-colors opacity-0 group-hover:opacity-100">
        <Trash2 className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

// ─── Recent row ────────────────────────────────────────────────────────────────

function RecentRow({ track, onPlay }: { track: TrackResponse; onPlay: () => void }) {
  return (
    <div className="group flex items-center gap-2 rounded-md px-2 py-2 hover:bg-secondary transition-colors">
      <button type="button" onClick={onPlay} aria-label={`Play ${track.title}`}
        className="flex h-7 w-7 shrink-0 items-center justify-center text-muted-foreground group-hover:text-foreground">
        <span className="text-xs translate-x-px">▶</span>
      </button>
      <div className="h-8 w-8 shrink-0 overflow-hidden rounded bg-secondary border border-border">
        {track.coverUrl ? <img src={track.coverUrl} alt="" className="h-full w-full object-cover" /> : null}
      </div>
      <div className="flex-1 min-w-0">
        <p className="truncate text-xs font-medium">{track.title}</p>
        <p className="truncate text-[10px] text-muted-foreground">{track.artist.stageName}</p>
      </div>
      <span className="text-[10px] text-muted-foreground tabular-nums shrink-0">{formatDuration(track.durationSec)}</span>
    </div>
  );
}

// ─── QueuePanel ────────────────────────────────────────────────────────────────

type Tab = 'queue' | 'recent';

export function QueuePanel({ onClose }: { onClose: () => void }) {
  const [tab, setTab] = useState<Tab>('queue');

  const {
    queue, queueIndex, currentTrack, isPlaying,
    recentlyPlayed, play, pause, resume,
    removeFromQueue, clearQueue, clearRecentlyPlayed,
  } = usePlayerStore();

  const handleQueuePlay = (track: TrackResponse, idx: number) => {
    if (currentTrack?.id === track.id) {
      isPlaying ? pause() : resume();
    } else {
      play(track, queue);
    }
  };

  const TabBtn = ({ id, label, Icon }: { id: Tab; label: string; Icon: React.ElementType }) => (
    <button type="button" onClick={() => setTab(id)}
      className={cn('flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors',
        tab === id ? 'bg-secondary text-foreground' : 'text-muted-foreground hover:text-foreground')}>
      <Icon className="h-3.5 w-3.5" />{label}
      {id === 'queue' && queue.length > 0 && (
        <span className="ml-0.5 rounded-full bg-primary/20 px-1.5 py-px text-[9px] font-bold text-primary">{queue.length}</span>
      )}
    </button>
  );

  return (
    <aside className="flex w-72 shrink-0 flex-col border-l border-border bg-card" aria-label="Queue">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border px-4 py-3 shrink-0">
        <div className="flex gap-1">
          <TabBtn id="queue"  label="Queue"  Icon={ListMusic} />
          <TabBtn id="recent" label="Recent" Icon={History} />
        </div>
        <button type="button" onClick={onClose} aria-label="Close queue"
          className="text-muted-foreground hover:text-foreground transition-colors">
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">

        {tab === 'queue' && (
          <div className="p-2">
            {/* Now playing */}
            {currentTrack && (
              <div className="mb-3">
                <p className="px-2 py-1 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60">Now playing</p>
                <div className="flex items-center gap-2 rounded-md bg-primary/10 border border-primary/20 px-2 py-2">
                  <span className="flex items-end gap-px h-4 w-7 shrink-0 justify-center" aria-hidden>
                    {[1.0, 1.6, 1.2].map((h, i) => (
                      <span key={i} className={cn('w-[3px] rounded-full bg-primary', !isPlaying && 'opacity-40')}
                        style={{ height: `${h * 10}px`, animation: isPlaying ? `wave-${i + 1} ${1.1 + i * 0.2}s ease-in-out infinite` : 'none' }} />
                    ))}
                  </span>
                  <div className="h-8 w-8 shrink-0 overflow-hidden rounded bg-secondary border border-border">
                    {currentTrack.coverUrl && <img src={currentTrack.coverUrl} alt="" className="h-full w-full object-cover" />}
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
                <div className="flex items-center justify-between px-2 py-1">
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60">
                    Up next ({queue.length})
                  </p>
                  <button type="button" onClick={clearQueue}
                    className="text-[10px] text-muted-foreground hover:text-destructive transition-colors">Clear</button>
                </div>
                <div className="space-y-0.5">
                  {queue.map((track, i) => (
                    <QueueRow key={`${track.id}-${i}`} track={track} index={i}
                      isCurrent={i === queueIndex} isPlaying={isPlaying && i === queueIndex}
                      onPlay={() => handleQueuePlay(track, i)}
                      onRemove={() => removeFromQueue(i)} />
                  ))}
                </div>
              </>
            )}

            {queue.length === 0 && !currentTrack && (
              <div className="flex flex-col items-center gap-3 py-16 text-center">
                <ListMusic className="h-10 w-10 text-muted-foreground/20" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Queue is empty</p>
                  <p className="mt-0.5 text-xs text-muted-foreground/60">Play a track to get started</p>
                </div>
              </div>
            )}
          </div>
        )}

        {tab === 'recent' && (
          <div className="p-2">
            {recentlyPlayed.length > 0 && (
              <div className="flex items-center justify-between px-2 py-1 mb-1">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60">Recently played</p>
                <button type="button" onClick={clearRecentlyPlayed}
                  className="text-[10px] text-muted-foreground hover:text-destructive transition-colors">Clear</button>
              </div>
            )}
            {recentlyPlayed.length > 0 ? (
              <div className="space-y-0.5">
                {recentlyPlayed.map(track => (
                  <RecentRow key={track.id} track={track} onPlay={() => play(track, [track])} />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center gap-3 py-16 text-center">
                <History className="h-10 w-10 text-muted-foreground/20" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">No recent plays</p>
                  <p className="mt-0.5 text-xs text-muted-foreground/60">Tracks you listen to will appear here</p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </aside>
  );
}
