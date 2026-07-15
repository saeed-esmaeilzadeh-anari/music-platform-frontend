'use client';

import Link from 'next/link';
import { Play, Pause, ListPlus } from 'lucide-react';
import { useTrack } from '@/hooks/use-tracks';
import { useComments, useCreateComment } from '@/hooks/use-catalog';
import { usePlayerStore } from '@/stores/player.store';
import { useAuthStore } from '@/stores/auth.store';
import { CoverImage } from '@/components/shared/cover-image';
import { LikeButton } from '@/components/shared/like-button';
import { AddToPlaylistModal } from '@/components/shared/add-to-playlist-modal';
import { DetailHeroSkeleton } from '@/components/shared/skeleton';
import { EmptyState } from '@/components/shared/empty-state';
import { ROUTES } from '@/lib/constants';
import { formatDuration, formatCount, formatRelativeTime, extractApiError } from '@/lib/utils';
import { Music2, MessageCircle, Send } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createCommentSchema, type CreateCommentFormValues } from '@/lib/validators';

// ─── Comments ────────────────────────────────────────────────────────────────

function CommentsSection({ trackId }: { trackId: string }) {
  const { isAuthenticated } = useAuthStore();
  const { data: comments, isLoading } = useComments({ targetType: 'TRACK', targetId: trackId });
  const createComment = useCreateComment();

  const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm<Pick<CreateCommentFormValues, 'content'>>({
    resolver: zodResolver(createCommentSchema.pick({ content: true })),
    defaultValues: { content: '' },
  });

  const onSubmit = async ({ content }: { content: string }) => {
    await createComment.mutateAsync({ content, targetType: 'TRACK', targetId: trackId });
    reset();
  };

  return (
    <section aria-label="Comments" className="mt-10">
      <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
        <MessageCircle className="h-5 w-5" aria-hidden />
        Comments
        {comments?.meta.totalItems ? (
          <span className="text-sm font-normal text-muted-foreground">({comments.meta.totalItems})</span>
        ) : null}
      </h2>

      {/* Comment input */}
      {isAuthenticated ? (
        <form onSubmit={handleSubmit(onSubmit)} className="flex gap-3 mb-6">
          <input
            {...register('content')}
            placeholder="Write a comment…"
            className="flex-1 rounded-md bg-secondary border border-border px-4 py-2.5 text-sm placeholder:text-muted-foreground/50 outline-none focus:border-primary/50 focus:ring-2 focus:ring-ring/20"
          />
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-primary text-primary-foreground hover:opacity-90 transition-opacity disabled:opacity-50"
            aria-label="Post comment"
          >
            <Send className="h-4 w-4" />
          </button>
        </form>
      ) : (
        <p className="mb-6 text-sm text-muted-foreground">
          <Link href={ROUTES.LOGIN} className="text-primary hover:underline">Sign in</Link> to leave a comment.
        </p>
      )}

      {/* List */}
      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex gap-3">
              <div className="h-8 w-8 rounded-full bg-secondary skeleton shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-3 w-24 bg-secondary skeleton rounded" />
                <div className="h-3 w-48 bg-secondary skeleton rounded" />
              </div>
            </div>
          ))}
        </div>
      ) : comments?.items.length ? (
        <ul className="space-y-4">
          {comments.items.map((c) => (
            <li key={c.id} className="flex gap-3">
              <div className="h-8 w-8 rounded-full bg-secondary border border-border flex items-center justify-center shrink-0 text-xs font-semibold text-muted-foreground">
                {c.userId.slice(0, 2).toUpperCase()}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-medium text-foreground">User</span>
                  <span className="text-[10px] text-muted-foreground">{formatRelativeTime(c.createdAt)}</span>
                  {c.isEdited && <span className="text-[10px] text-muted-foreground">(edited)</span>}
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">{c.content}</p>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-muted-foreground">No comments yet. Be the first!</p>
      )}
    </section>
  );
}

// ─── TrackClient ─────────────────────────────────────────────────────────────

export function TrackClient({ id }: { id: string }) {
  const { data: track, isLoading } = useTrack(id);
  const { currentTrack, isPlaying, play, pause } = usePlayerStore();
  const [showPlaylistModal, setShowPlaylistModal] = useState(false);

  const isCurrentTrack = currentTrack?.id === id;

  const handlePlay = () => {
    if (!track) return;
    if (isCurrentTrack) {
      isPlaying ? pause() : usePlayerStore.getState().resume();
    } else {
      play(track, [track]);
    }
  };

  if (isLoading) return <DetailHeroSkeleton />;
  if (!track) return <EmptyState icon={Music2} title="Track not found" />;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 lg:px-8">
      {/* Hero */}
      <div className="flex flex-col sm:flex-row gap-6 mb-8">
        <div className="h-48 w-48 shrink-0 rounded-md shadow-2xl overflow-hidden mx-auto sm:mx-0">
          <CoverImage src={track.coverUrl} alt={track.title} type="track" size="xl" />
        </div>
        <div className="flex-1 min-w-0 sm:self-end pb-1">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Track</span>
            {track.isExplicit && (
              <span className="text-xs font-bold uppercase bg-muted-foreground/20 text-muted-foreground px-1.5 py-0.5 rounded">
                E
              </span>
            )}
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight leading-tight mb-2">
            {track.title}
          </h1>
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground flex-wrap">
            <Link href={ROUTES.ARTIST(track.artist.id)} className="font-medium text-foreground hover:underline">
              {track.artist.stageName}
            </Link>
            {track.albumId && (
              <><span aria-hidden>·</span>
              <Link href={ROUTES.ALBUM(track.albumId)} className="hover:underline hover:text-foreground">Album</Link></>
            )}
            <span aria-hidden>·</span>
            <span>{formatDuration(track.durationSec)}</span>
            <span aria-hidden>·</span>
            <span>{formatCount(track.playCount)} plays</span>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-4 mb-8 pb-6 border-b border-border">
        <button
          type="button"
          onClick={handlePlay}
          className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground hover:scale-105 active:scale-95 transition-transform"
          aria-label={isCurrentTrack && isPlaying ? 'Pause' : 'Play'}
        >
          {isCurrentTrack && isPlaying
            ? <Pause className="h-5 w-5 fill-current" />
            : <Play className="h-5 w-5 fill-current translate-x-px" />}
        </button>
        <LikeButton targetType="TRACK" targetId={id} size="md" />
        <button
          type="button"
          onClick={() => setShowPlaylistModal(true)}
          aria-label="Add to playlist"
          className="flex items-center gap-2 rounded-md border border-border px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground hover:border-primary/40 transition-colors"
        >
          <ListPlus className="h-4 w-4" aria-hidden />
          Add to playlist
        </button>
      </div>

      {/* Waveform placeholder */}
      <div className="mb-8 h-16 rounded-md bg-secondary/50 border border-border flex items-center justify-center gap-px px-4 overflow-hidden">
        {Array.from({ length: 80 }).map((_, i) => (
          <div
            key={i}
            className="w-0.5 rounded-full bg-waveform-inactive"
            style={{ height: `${20 + Math.sin(i * 0.4) * 15 + Math.random() * 20}%` }}
          />
        ))}
      </div>

      {/* Comments */}
      <CommentsSection trackId={id} />

      {/* Playlist modal */}
      {showPlaylistModal && (
        <AddToPlaylistModal trackId={id} onClose={() => setShowPlaylistModal(false)} />
      )}
    </div>
  );
}