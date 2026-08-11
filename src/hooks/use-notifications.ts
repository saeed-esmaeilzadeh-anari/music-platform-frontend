'use client';

import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
  type InfiniteData,
} from '@tanstack/react-query';
import { notificationsService } from '@/services/notifications.service';
import { queryKeys } from '@/lib/constants/query-keys';
import { useToast } from '@/providers/toast-provider';
import type { NotificationResponse, PaginatedResult } from '@/types';

const LIMIT = 20;

// ─── Infinite list ────────────────────────────────────────────────────────────

export function useNotificationsInfinite() {
  return useInfiniteQuery<
    PaginatedResult<NotificationResponse>,
    Error,
    InfiniteData<PaginatedResult<NotificationResponse>>,
    ReturnType<typeof queryKeys.notifications.all>,
    number
  >({
    queryKey: queryKeys.notifications.all(),
    queryFn: ({ pageParam }) =>
      notificationsService.findOwn({ page: pageParam, limit: LIMIT }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.meta.hasNextPage ? lastPage.meta.page + 1 : undefined,
    staleTime: 30_000,
  });
}

// ─── Unread count (polled every 30 s) ────────────────────────────────────────

export function useUnreadCount() {
  return useQuery({
    queryKey: queryKeys.notifications.unreadCount(),
    queryFn: () => notificationsService.getUnreadCount(),
    staleTime: 30_000,
    refetchInterval: 30_000,
  });
}

// ─── Mark single read (optimistic) ───────────────────────────────────────────

export function useMarkRead() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => notificationsService.markRead(id),

    onMutate: async (id) => {
      // Cancel in-flight refetches so they don't overwrite our optimistic update
      await qc.cancelQueries({ queryKey: queryKeys.notifications.all() });
      await qc.cancelQueries({ queryKey: queryKeys.notifications.unreadCount() });

      // Snapshot for rollback
      const prevInfinite = qc.getQueryData<InfiniteData<PaginatedResult<NotificationResponse>>>(
        queryKeys.notifications.all(),
      );
      const prevCount = qc.getQueryData<{ count: number }>(
        queryKeys.notifications.unreadCount(),
      );

      // Optimistically mark the notification as read in the infinite cache
      if (prevInfinite) {
        qc.setQueryData<InfiniteData<PaginatedResult<NotificationResponse>>>(
          queryKeys.notifications.all(),
          {
            ...prevInfinite,
            pages: prevInfinite.pages.map((page) => ({
              ...page,
              items: page.items.map((n) =>
                n.id === id ? { ...n, isRead: true } : n,
              ),
            })),
          },
        );
      }

      // Decrement unread count
      if (prevCount) {
        qc.setQueryData(queryKeys.notifications.unreadCount(), {
          count: Math.max(0, prevCount.count - 1),
        });
      }

      return { prevInfinite, prevCount };
    },

    onError: (_err, _id, ctx) => {
      if (ctx?.prevInfinite)
        qc.setQueryData(queryKeys.notifications.all(), ctx.prevInfinite);
      if (ctx?.prevCount)
        qc.setQueryData(queryKeys.notifications.unreadCount(), ctx.prevCount);
    },

    onSettled: () => {
      qc.invalidateQueries({ queryKey: queryKeys.notifications.unreadCount() });
    },
  });
}

// ─── Mark all read (optimistic) ───────────────────────────────────────────────

export function useMarkAllRead() {
  const qc = useQueryClient();
  const { success } = useToast();

  return useMutation({
    mutationFn: () => notificationsService.markAllRead(),

    onMutate: async () => {
      await qc.cancelQueries({ queryKey: queryKeys.notifications.all() });
      await qc.cancelQueries({ queryKey: queryKeys.notifications.unreadCount() });

      const prevInfinite = qc.getQueryData<InfiniteData<PaginatedResult<NotificationResponse>>>(
        queryKeys.notifications.all(),
      );
      const prevCount = qc.getQueryData<{ count: number }>(
        queryKeys.notifications.unreadCount(),
      );

      // Mark every cached notification as read
      if (prevInfinite) {
        qc.setQueryData<InfiniteData<PaginatedResult<NotificationResponse>>>(
          queryKeys.notifications.all(),
          {
            ...prevInfinite,
            pages: prevInfinite.pages.map((page) => ({
              ...page,
              items: page.items.map((n) => ({ ...n, isRead: true })),
            })),
          },
        );
      }

      // Zero the badge count immediately
      qc.setQueryData(queryKeys.notifications.unreadCount(), { count: 0 });

      return { prevInfinite, prevCount };
    },

    onError: (_err, _vars, ctx) => {
      if (ctx?.prevInfinite)
        qc.setQueryData(queryKeys.notifications.all(), ctx.prevInfinite);
      if (ctx?.prevCount)
        qc.setQueryData(queryKeys.notifications.unreadCount(), ctx.prevCount);
    },

    onSuccess: () => {
      success('All notifications marked as read');
      qc.invalidateQueries({ queryKey: queryKeys.notifications.all() });
      qc.invalidateQueries({ queryKey: queryKeys.notifications.unreadCount() });
    },
  });
}
