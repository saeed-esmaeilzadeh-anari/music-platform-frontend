'use client';

import { useState } from 'react';
import {
  MoreHorizontal, Pencil, Trash2, Reply,
  CheckCircle2, AlertCircle,
} from 'lucide-react';
import { cn, formatRelativeTime } from '@/lib/utils';
import { useAuthStore } from '@/stores/auth.store';
import { useUpdateComment, useDeleteComment } from '@/hooks/use-comments';
import { CommentForm } from './comment-form';
import type { CommentResponse, CommentTargetType } from '@/types';

// ─── User avatar ──────────────────────────────────────────────────────────────

function Avatar({ userId, username }: { userId: string; username?: string }) {
  const initials = username
    ? username.slice(0, 2).toUpperCase()
    : userId.slice(0, 2).toUpperCase();

  // Deterministic colour from userId
  const colours = [
    'bg-violet-500/20 text-violet-400',
    'bg-blue-500/20 text-blue-400',
    'bg-emerald-500/20 text-emerald-400',
    'bg-amber-500/20 text-amber-400',
    'bg-rose-500/20 text-rose-400',
    'bg-cyan-500/20 text-cyan-400',
    'bg-pink-500/20 text-pink-400',
  ];
  const colour = colours[userId.charCodeAt(0) % colours.length];

  return (
    <div className={cn(
      'flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold select-none',
      colour,
    )}>
      {initials}
    </div>
  );
}

// ─── Comment context menu ─────────────────────────────────────────────────────

function CommentMenu({
  isOwner,
  onEdit,
  onDelete,
  isPending,
}: {
  isOwner: boolean;
  onEdit:  () => void;
  onDelete: () => void;
  isPending: boolean;
}) {
  const [open, setOpen] = useState(false);
  if (!isOwner) return null;

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        aria-label="Comment options"
        aria-expanded={open}
        className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors opacity-0 group-hover/comment:opacity-100"
      >
        <MoreHorizontal className="h-3.5 w-3.5" aria-hidden />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} aria-hidden />
          <div className="absolute right-0 top-full mt-1 z-20 w-36 rounded-lg border border-border bg-card shadow-xl py-1">
            <button
              type="button"
              onClick={() => { onEdit(); setOpen(false); }}
              className="flex w-full items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-secondary transition-colors"
            >
              <Pencil className="h-3.5 w-3.5 shrink-0" /> Edit
            </button>
            <button
              type="button"
              onClick={() => { onDelete(); setOpen(false); }}
              disabled={isPending}
              className="flex w-full items-center gap-2 px-3 py-2 text-sm text-destructive hover:bg-destructive/10 transition-colors disabled:opacity-50"
            >
              <Trash2 className="h-3.5 w-3.5 shrink-0" />
              {isPending ? 'Deleting…' : 'Delete'}
            </button>
          </div>
        </>
      )}
    </div>
  );
}

// ─── CommentItem ──────────────────────────────────────────────────────────────

interface CommentItemProps {
  comment:     CommentResponse;
  targetType:  CommentTargetType;
  targetId:    string;
  replies?:    CommentResponse[];
  depth?:      number;     // 0 = top-level, 1 = reply (max nesting)
}

export function CommentItem({
  comment,
  targetType,
  targetId,
  replies = [],
  depth = 0,
}: CommentItemProps) {
  const { user }    = useAuthStore();
  const isOwner     = user?.id === comment.userId;
  const isOptimistic = comment.userId === '__optimistic__';

  const [editing,   setEditing]   = useState(false);
  const [replying,  setReplying]  = useState(false);

  const update = useUpdateComment(targetType, targetId);
  const remove = useDeleteComment(targetType, targetId);

  // Display name — current user gets their username, others get shortened ID
  const displayName = isOptimistic
    ? (user?.username ?? 'You')
    : isOwner
      ? (user?.username ?? `User ${comment.userId.slice(0, 6)}`)
      : `User ${comment.userId.slice(0, 8)}`;

  const handleEdit = async (content: string) => {
    await update.mutateAsync({ id: comment.id, content });
    setEditing(false);
  };

  const handleDelete = () => {
    remove.mutate(comment.id);
  };

  const handleReplySubmit = async (_content: string) => {
    // Reply creation is handled by CommentThread passing onReply
    setReplying(false);
  };

  return (
    <div className={cn('group/comment', depth > 0 && 'pl-10 border-l border-border/50 ml-4')}>
      <div className="flex gap-3">
        {/* Avatar */}
        <Avatar userId={comment.userId} username={isOwner ? user?.username : undefined} />

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-sm font-semibold text-foreground">{displayName}</span>
            {isOwner && (
              <span className="text-[10px] rounded-full bg-primary/10 text-primary px-1.5 py-0.5 font-medium">
                You
              </span>
            )}
            <span className="text-[11px] text-muted-foreground">
              {formatRelativeTime(comment.createdAt)}
            </span>
            {comment.isEdited && (
              <span className="text-[10px] text-muted-foreground/60">(edited)</span>
            )}
            {isOptimistic && (
              <span className="text-[10px] text-muted-foreground/60 flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse inline-block" />
                Posting…
              </span>
            )}
          </div>

          {/* Body */}
          {editing ? (
            <CommentForm
              targetType={targetType}
              targetId={targetId}
              parentId={comment.parentId ?? undefined}
              initialValue={comment.content}
              mode="edit"
              autoFocus
              onSubmit={handleEdit}
              onCancel={() => setEditing(false)}
            />
          ) : (
            <p className={cn(
              'text-sm text-foreground leading-relaxed whitespace-pre-wrap break-words',
              isOptimistic && 'opacity-60',
            )}>
              {comment.content}
            </p>
          )}

          {/* Action row */}
          {!editing && (
            <div className="flex items-center gap-1 mt-2">
              {/* Reply (only top-level) */}
              {depth === 0 && !isOptimistic && (
                <button
                  type="button"
                  onClick={() => setReplying(v => !v)}
                  className={cn(
                    'flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium transition-colors',
                    replying
                      ? 'text-primary bg-primary/10'
                      : 'text-muted-foreground hover:text-foreground hover:bg-secondary',
                  )}
                >
                  <Reply className="h-3 w-3" /> Reply
                  {replies.length > 0 && (
                    <span className="ml-0.5 text-[10px] text-muted-foreground/60">
                      {replies.length}
                    </span>
                  )}
                </button>
              )}
            </div>
          )}

          {/* Inline reply form */}
          {replying && (
            <div className="mt-3">
              <CommentForm
                targetType={targetType}
                targetId={targetId}
                parentId={comment.id}
                mode="reply"
                autoFocus
                onSubmit={handleReplySubmit}
                onCancel={() => setReplying(false)}
              />
            </div>
          )}
        </div>

        {/* Context menu (top-right, visible on hover) */}
        <CommentMenu
          isOwner={isOwner && !isOptimistic}
          onEdit={() => setEditing(true)}
          onDelete={handleDelete}
          isPending={remove.isPending}
        />
      </div>

      {/* Replies */}
      {replies.length > 0 && (
        <div className="mt-3 space-y-4">
          {replies.map(reply => (
            <CommentItem
              key={reply.id}
              comment={reply}
              targetType={targetType}
              targetId={targetId}
              depth={1}
            />
          ))}
        </div>
      )}
    </div>
  );
}
