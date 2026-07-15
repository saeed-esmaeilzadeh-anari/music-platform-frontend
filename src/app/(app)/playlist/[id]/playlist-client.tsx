'use client';

import Link from 'next/link';
import { Play, Trash2, Lock, Globe, MoreHorizontal } from 'lucide-react';
import { usePlaylist, useRemoveTrackFromPlaylist } from '@/hooks/use-playlists';
import { usePlayerStore } from '@/stores/player.store';
import { useAuthStore } from '@/stores/auth.store';
import { CoverImage } from '@/components/shared/cover-image';
import { LikeButton } from '@/components/shared/like-button';
import { DetailHeroSkeleton, TrackRowSkeleton } from '@/components/shared/skeleton';
import { EmptyState } from '@/components/shared/empty-state';
import { formatDuration, formatRelativeTime, cn } from '@/lib/utils';
import { ListMusic, Clock } from 'lucide-react';
import type { TrackResponse } from '@/types';

export function PlaylistClient({ id }: { id: string }) {
  const { data: playlist, isLoading } = usePlaylist(id);
  const { user } = useAuthStore();
  const { play } = usePlayerStore();

  if (isLoading) return <DetailHeroSkeleton />;
  if (!playlist) return <EmptyState icon={ListMusic} title="Playlist not found" />;

  // Build track list from PlaylistResponse — the backend returns tracks nested inside
  // The playlist response from GET /playlists/:id includes track data via PlaylistTrack
  const tracks: TrackResponse[] = (playlist as any).tracks?.map((pt: any) => pt.track).filter(Boolean) ?? [];
  const isOwner = user?.id === playlist.ownerId;
  const totalDuration = tracks.reduce((s, t) => s + t.durationSec, 0);

  return (
    <div className="pb-12">
      {/* Hero */}
      <div className="bg-gradient-to-b from-primary/15 via-secondary/50 to-background px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-end gap-6 max-w-4xl">
          <div className="h-44 w-44 shrink-0 rounded-md shadow-2xl overflow-hidden">
            <CoverImage src={playlist.coverUrl} alt={playlist.title} type="playlist" size="xl" />
          </div>
          <div className="min-w-0 pb-1">
            <div className="flex items-center gap-2 mb-2">
              {playlist.visibility === 'PRIVATE'
                ? <><Lock className="h-3.5 w-3.5 text-muted-foreground" /><span className="text-xs uppercase tracking-widest text-muted-foreground">Private playlist</span></>
                : <><Globe className="h-3.5 w-3.5 text-muted-foreground" /><span className="text-xs uppercase tracking-widest text-muted-foreground">Public playlist</span></>}
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-2 leading-tight">
              {playlist.title}
            </h1>
            {playlist.description && (
              <p className="text-sm text-muted-foreground mb-2 max-w-md">{playlist.description}</p>
            )}
            <p className="text-sm text-muted-foreground">
              {tracks.length} tracks
              {totalDuration > 0 && <> · {formatDuration(totalDuration)}</>}
            </p>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-4 px-6 lg:px-8 py-5 border-b border-border">
        <button
          type="button"
          onClick={() => tracks.length && play(tracks[0], tracks)}
          disabled={!tracks.length}
          className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground hover:scale-105 active:scale-95 transition-transform disabled:opacity-40"
          aria-label="Play playlist"
        >
          <Play className="h-5 w-5 fill-current translate-x-px" />
        </button>
        <LikeButton targetType="PLAYLIST" targetId={id} />
      </div>

      {/* Track list */}
      <div className="px-3 lg:px-5 mt-4">
        <div className="flex items-center gap-3 px-3 pb-2 border-b border-border/50 text-[11px] uppercase tracking-widest text-muted-foreground/60 font-medium">
          <span className="w-8 text-right">#</span>
          <span className="flex-1">Title</span>
          <span className="hidden md:block text-right">Added</span>
          <span className="w-10 text-right"><Clock className="h-3 w-3 ml-auto" /></span>
          {isOwner && <span className="w-8" />}
        </div>

        {tracks.length
          ? tracks.map((track, i) => (
              <PlaylistTrackRow
                key={track.id}
                track={track}
                index={i}
                queue={tracks}
                playlistId={id}
                isOwner={isOwner}
              />
            ))
          : <EmptyState icon={ListMusic} title="No tracks yet" description="Add tracks using the ⋯ menu on any track." className="py-12" />}
      </div>
    </div>
  );
}

function PlaylistTrackRow({ track, index, queue, playlistId, isOwner }: {
  track: TrackResponse; index: number; queue: TrackResponse[]; playlistId: string; isOwner: boolean;
}) {
  const { currentTrack, isPlaying, play, pause } = usePlayerStore();
  const removeTrack = useRemoveTrackFromPlaylist(playlistId);
  const isCurrent = currentTrack?.id === track.id;

  return (
    <div className={cn('group flex items-center gap-3 rounded-md px-3 py-2.5 hover:bg-track-hover transition-colors', isCurrent && 'bg-primary/5')}>
      <div className="flex h-8 w-8 shrink-0 items-center justify-center">
        {isCurrent ? (
          <button type="button" onClick={() => isCurrent && (isPlaying ? pause() : usePlayerStore.getState().resume())}
            className="text-primary">
            {isPlaying ? <span className="text-primary text-xs">▐▐</span> : <span className="text-primary translate-x-px">▶</span>}
          </button>
        ) : (
          <>
            <span className="text-sm tabular-nums text-muted-foreground group-hover:hidden">{index + 1}</span>
            <button type="button" onClick={() => play(track, queue)} className="hidden group-hover:flex text-foreground">
              <span className="translate-x-px">▶</span>
            </button>
          </>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className={cn('truncate text-sm font-medium', isCurrent && 'text-primary')}>{track.title}</p>
        <p className="truncate text-xs text-muted-foreground mt-0.5">{track.artist.stageName}</p>
      </div>
      <span className="hidden md:block text-xs text-muted-foreground">{formatRelativeTime(track.createdAt)}</span>
      <span className="text-xs text-muted-foreground tabular-nums w-10 text-right">{formatDuration(track.durationSec)}</span>
      {isOwner && (
        <button type="button" onClick={() => removeTrack.mutate(track.id)}
          aria-label="Remove from playlist"
          className="w-8 opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-all">
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  );
}