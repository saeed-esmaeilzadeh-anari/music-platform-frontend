'use client';

import { useState } from 'react';
import { MessageSquare, ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/stores/auth.store';
import {
  useComments,
  useCreateComment,
} from '@/hooks/use-comments';
import { CommentItem } from './comment-item';
import { CommentForm } from './comment-form';
import type { CommentTargetType, CommentResponse } from '@/types';

// ─── Skeleton rows ────────────────────────────────────────────────────────────

function CommentSkeleton({ indent = false }: { indent?: boolean }) {
  return (
    <div className={cn('flex gap-3', indent && 'pl-10 border-l border-border/50 ml-4')}>
      <div className="h-8 w-8 rounded-full bg-secondary animate-pulse shrink-0" />
      <div className="flex-1 space-y-2 pt-0.5">
        <div className="flex items-center gap-2">
          <div className="h-3 w-20 rounded bg-secondary animate-pulse" />
          <div className="h-3 w-12 rounded bg-secondary animate-pulse" />
        </div>
        <div className="h-3.5 w-full rounded bg-secondary animate-pulse" />
        <div className="h-3.5 w-4/5 rounded bg-secondary animate-pulse" />
      </div>
    </div>
  );
}

// ─── Empty state ──────────────────────────────────────────────────────────────

function EmptyComments() {
  return (
    <div className="flex flex-col items-center gap-3 py-10 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-secondary border border-border">
        <MessageSquare className="h-5 w-5 text-muted-foreground/40" aria-hidden />
      </div>
      <div>
        <p className="text-sm font-medium text-foreground">No comments yet</p>
        <p className="mt-0.5 text-xs text-muted-foreground">Be the first to share your thoughts.</p>
      </div>
    </div>
  );
}

// ─── Auth prompt ──────────────────────────────────────────────────────────────

function AuthPrompt() {
  return (
    <div className="rounded-xl border border-border bg-secondary/30 px-4 py-3 text-sm text-muted-foreground">
      <a href="/login" className="text-primary hover:underline font-medium">Sign in</a>
      {' '}to leave a comment.
    </div>
  );
}

// ─── CommentThread ────────────────────────────────────────────────────────────

interface CommentThreadProps {
  targetType:  CommentTargetType;
  targetId:    string;
  /** Label shown in the section header */
  label?: string;
  /** Collapse thread behind "N comments" toggle when true */
  collapsible?: boolean;
}

export function CommentThread({
  targetType, targetId, label = 'Comments', collapsible = false,
}: CommentThreadProps) {
  const { isAuthenticated } = useAuthStore();
  const [collapsed, setCollapsed] = useState(false);

  const { data, isLoading, isError } = useComments(targetType, targetId);
  const createComment = useCreateComment(targetType, targetId);

  // Separate top-level comments from replies
  const allItems   = data?.items ?? [];
  const topLevel   = allItems.filter(c => !c.parentId);
  const totalCount = data?.meta.totalItems ?? 0;

  // Build a map of parentId → replies (sorted oldest-first)
  const replyMap = new Map<string, CommentResponse[]>();
  for (const c of allItems) {
    if (!c.parentId) continue;
    const arr = replyMap.get(c.parentId) ?? [];
    arr.push(c);
    replyMap.set(c.parentId, arr);
  }

  const handleCreate = async (content: string) => {
    await createComment.mutateAsync({
      content,
      targetType,
      targetId,
    });
  };

  const handleReply = async (content: string, parentId: string) => {
    await createComment.mutateAsync({
      content,
      targetType,
      targetId,
      parentId,
    });
  };

  return (
    <section aria-label={label} className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => collapsible && setCollapsed(v => !v)}
          className={cn(
            'flex items-center gap-2.5 text-lg font-bold tracking-tight',
            collapsible && 'hover:text-primary transition-colors',
          )}
          aria-expanded={!collapsed}
        >
          <MessageSquare className="h-5 w-5 text-primary" aria-hidden />
          <span>{label}</span>
          {totalCount > 0 && (
            <span className="text-sm font-normal text-muted-foreground">
              ({totalCount})
            </span>
          )}
          {collapsible && (
            collapsed
              ? <ChevronDown className="h-4 w-4 text-muted-foreground" />
              : <ChevronUp   className="h-4 w-4 text-muted-foreground" />
          )}
        </button>
      </div>

      {!collapsed && (
        <>
          {/* Compose box */}
          {isAuthenticated ? (
            <CommentForm
              targetType={targetType}
              targetId={targetId}
              mode="create"
              onSubmit={handleCreate}
            />
          ) : (
            <AuthPrompt />
          )}

          {/* Comment list */}
          <div className="space-y-6">
            {isLoading && (
              Array.from({ length: 3 }).map((_, i) => <CommentSkeleton key={i} />)
            )}

            {isError && !isLoading && (
              <p className="text-sm text-muted-foreground text-center py-6">
                Failed to load comments.
              </p>
            )}

            {!isLoading && !isError && topLevel.length === 0 && (
              <EmptyComments />
            )}

            {topLevel.map(comment => (
              <CommentItemWithReply
                key={comment.id}
                comment={comment}
                targetType={targetType}
                targetId={targetId}
                replies={replyMap.get(comment.id) ?? []}
                onReply={handleReply}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
}

// ─── CommentItemWithReply ─────────────────────────────────────────────────────
// Wraps CommentItem to wire up the reply form correctly, keeping the reply
// submission logic here where createComment is in scope.

function CommentItemWithReply({
  comment, targetType, targetId, replies, onReply,
}: {
  comment:    CommentResponse;
  targetType: CommentTargetType;
  targetId:   string;
  replies:    CommentResponse[];
  onReply:    (content: string, parentId: string) => Promise<void>;
}) {
  const [replying, setReplying] = useState(false);

  return (
    <div>
      <CommentItem
        comment={comment}
        targetType={targetType}
        targetId={targetId}
        replies={replies}
        depth={0}
      />

      {/* Reply trigger exposed as sibling so CommentItem stays pure */}
      {replying && (
        <div className="mt-3 pl-11">
          <CommentForm
            targetType={targetType}
            targetId={targetId}
            parentId={comment.id}
            mode="reply"
            autoFocus
            onSubmit={async (content) => {
              await onReply(content, comment.id);
              setReplying(false);
            }}
            onCancel={() => setReplying(false)}
          />
        </div>
      )}
    </div>
  );
}
