'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { commentsService } from '@/services/comments.service';
import { queryKeys }        from '@/lib/constants/query-keys';
import { STALE_TIME }       from '@/lib/constants';
import { useToast }         from '@/providers/toast-provider';
import { extractApiError }  from '@/lib/utils';
import type {
  CommentResponse,
  CommentTargetType,
  CreateCommentDto,
  PaginatedResult,
} from '@/types';

// ─── Query helper ─────────────────────────────────────────────────────────────

function commentsKey(targetType: CommentTargetType, targetId: string, params?: object) {
  return queryKeys.comments.byTarget(targetType, targetId, params);
}

// ─── Fetch all comments for a target ─────────────────────────────────────────

export function useComments(targetType: CommentTargetType, targetId: string) {
  return useQuery({
    queryKey: commentsKey(targetType, targetId),
    queryFn:  () =>
      commentsService.findByTarget({ targetType, targetId, limit: 100, page: 1 }),
    staleTime: STALE_TIME.SHORT,
    enabled:   !!targetId,
  });
}

// ─── Create (optimistic) ──────────────────────────────────────────────────────

export function useCreateComment(targetType: CommentTargetType, targetId: string) {
  const qc        = useQueryClient();
  const { error } = useToast();

  return useMutation({
    mutationFn: (dto: CreateCommentDto) => commentsService.create(dto),

    onMutate: async (dto) => {
      const key = commentsKey(targetType, targetId);
      await qc.cancelQueries({ queryKey: key });

      const previous = qc.getQueryData<PaginatedResult<CommentResponse>>(key);

      // Build an optimistic comment so the UI updates immediately
      const optimistic: CommentResponse = {
        id:         `optimistic-${Date.now()}`,
        content:    dto.content,
        userId:     '__optimistic__',   // replaced on settle
        targetType: dto.targetType,
        parentId:   dto.parentId ?? null,
        isEdited:   false,
        createdAt:  new Date().toISOString(),
      };

      if (previous) {
        qc.setQueryData<PaginatedResult<CommentResponse>>(key, {
          ...previous,
          items: [...previous.items, optimistic],
          meta:  { ...previous.meta, totalItems: previous.meta.totalItems + 1 },
        });
      }

      return { previous };
    },

    onError: (err, _dto, ctx) => {
      if (ctx?.previous) {
        qc.setQueryData(commentsKey(targetType, targetId), ctx.previous);
      }
      error('Failed to post comment', extractApiError(err));
    },

    onSettled: () => {
      qc.invalidateQueries({ queryKey: commentsKey(targetType, targetId) });
    },
  });
}

// ─── Update / edit (optimistic) ───────────────────────────────────────────────

export function useUpdateComment(targetType: CommentTargetType, targetId: string) {
  const qc        = useQueryClient();
  const { error } = useToast();

  return useMutation({
    mutationFn: ({ id, content }: { id: string; content: string }) =>
      commentsService.update(id, { content }),

    onMutate: async ({ id, content }) => {
      const key = commentsKey(targetType, targetId);
      await qc.cancelQueries({ queryKey: key });

      const previous = qc.getQueryData<PaginatedResult<CommentResponse>>(key);

      if (previous) {
        qc.setQueryData<PaginatedResult<CommentResponse>>(key, {
          ...previous,
          items: previous.items.map(c =>
            c.id === id ? { ...c, content, isEdited: true } : c,
          ),
        });
      }

      return { previous };
    },

    onError: (err, _vars, ctx) => {
      if (ctx?.previous) {
        qc.setQueryData(commentsKey(targetType, targetId), ctx.previous);
      }
      error('Failed to update comment', extractApiError(err));
    },

    onSettled: () => {
      qc.invalidateQueries({ queryKey: commentsKey(targetType, targetId) });
    },
  });
}

// ─── Delete (optimistic) ──────────────────────────────────────────────────────

export function useDeleteComment(targetType: CommentTargetType, targetId: string) {
  const qc          = useQueryClient();
  const { success, error } = useToast();

  return useMutation({
    mutationFn: (id: string) => commentsService.delete(id),

    onMutate: async (id) => {
      const key = commentsKey(targetType, targetId);
      await qc.cancelQueries({ queryKey: key });

      const previous = qc.getQueryData<PaginatedResult<CommentResponse>>(key);

      if (previous) {
        // Also remove all replies to this comment
        qc.setQueryData<PaginatedResult<CommentResponse>>(key, {
          ...previous,
          items: previous.items.filter(c => c.id !== id && c.parentId !== id),
          meta:  {
            ...previous.meta,
            totalItems: Math.max(
              0,
              previous.meta.totalItems -
                previous.items.filter(c => c.id === id || c.parentId === id).length,
            ),
          },
        });
      }

      return { previous };
    },

    onError: (err, _id, ctx) => {
      if (ctx?.previous) {
        qc.setQueryData(commentsKey(targetType, targetId), ctx.previous);
      }
      error('Failed to delete comment', extractApiError(err));
    },

    onSettled: () => {
      qc.invalidateQueries({ queryKey: commentsKey(targetType, targetId) });
    },

    onSuccess: () => success('Comment deleted'),
  });
}
