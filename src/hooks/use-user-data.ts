'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { notificationsService } from '@/services/notifications.service';
import { subscriptionService } from '@/services/subscription.service';
import { paymentsService } from '@/services/payments.service';
import { usersService } from '@/services/users.service';
import { uploadService } from '@/services/upload.service';
import { listeningHistoryService } from '@/services/listening-history.service';
import { queryKeys } from '@/lib/constants/query-keys';
import { STALE_TIME } from '@/lib/constants';
import { useToast } from '@/providers/toast-provider';
import { extractApiError } from '@/lib/utils/index';
import type { CreateSubscriptionDto, PaginationQuery, RequestUploadDto, UpdateUserDto } from '@/types';

// ─── User / Profile ───────────────────────────────────────────────────────────

export function useMe() {
  return useQuery({
    queryKey: queryKeys.users.me(),
    queryFn: () => usersService.getMe(),
    staleTime: STALE_TIME.INSTANT,
  });
}

export function useUpdateMe() {
  const qc             = useQueryClient();
  const { success, error } = useToast();
  return useMutation({
    mutationFn: (dto: UpdateUserDto) => usersService.updateMe(dto),
    onSuccess: () => {
      // Invalidate so every consumer of useMe() gets fresh data
      qc.invalidateQueries({ queryKey: queryKeys.users.me() });
      success('Profile updated');
    },
    onError: (err) => error('Update failed', extractApiError(err)),
  });
}

// ─── Notifications ────────────────────────────────────────────────────────────

export function useNotifications(query?: PaginationQuery) {
  return useQuery({
    queryKey: queryKeys.notifications.all(query),
    queryFn: () => notificationsService.findOwn(query),
    staleTime: STALE_TIME.SHORT,
    refetchInterval: 30_000,
  });
}

export function useUnreadNotificationCount() {
  return useQuery({
    queryKey: queryKeys.notifications.unreadCount(),
    queryFn: () => notificationsService.getUnreadCount(),
    staleTime: STALE_TIME.SHORT,
    refetchInterval: 30_000,
  });
}

export function useMarkNotificationRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => notificationsService.markRead(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.notifications.unreadCount() });
      qc.invalidateQueries({ queryKey: queryKeys.notifications.all() });
    },
  });
}

export function useMarkAllNotificationsRead() {
  const qc = useQueryClient();
  const { success } = useToast();
  return useMutation({
    mutationFn: () => notificationsService.markAllRead(),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.notifications.unreadCount() });
      qc.invalidateQueries({ queryKey: queryKeys.notifications.all() });
      success('All marked as read');
    },
  });
}

// ─── Subscription ─────────────────────────────────────────────────────────────

export function useActiveSubscription() {
  return useQuery({
    queryKey: queryKeys.subscription.active(),
    queryFn: () => subscriptionService.getActive(),
    staleTime: STALE_TIME.INSTANT,
    retry: (_, err: unknown) => {
      const status = (err as { response?: { status?: number } }).response?.status;
      return status !== 404;
    },
  });
}

export function useCreateCheckoutSession() {
  const { error } = useToast();
  return useMutation({
    mutationFn: (dto: CreateSubscriptionDto) => subscriptionService.createCheckout(dto),
    onSuccess: (data) => {
      window.location.href = data.checkoutUrl;
    },
    onError: (err) => error('Checkout failed', extractApiError(err)),
  });
}

export function useCancelSubscription() {
  const qc = useQueryClient();
  const { success, error } = useToast();
  return useMutation({
    mutationFn: () => subscriptionService.cancel(),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.subscription.active() });
      success('Subscription cancelled', 'Access continues until the end of the billing period.');
    },
    onError: (err) => error('Cancellation failed', extractApiError(err)),
  });
}

// ─── Payments ─────────────────────────────────────────────────────────────────

export function usePaymentHistory(query?: PaginationQuery) {
  return useQuery({
    queryKey: queryKeys.payments.history(query),
    queryFn: () => paymentsService.getHistory(query),
    staleTime: STALE_TIME.STANDARD,
  });
}

// ─── Listening History ────────────────────────────────────────────────────────

export function useListeningHistory(query?: PaginationQuery) {
  return useQuery({
    queryKey: queryKeys.history.all(query),
    queryFn: () => listeningHistoryService.findOwn(query),
    staleTime: STALE_TIME.SHORT,
  });
}

// ─── Upload ───────────────────────────────────────────────────────────────────

export function useUpload() {
  const { success, error } = useToast();

  return useMutation({
    mutationFn: ({
      dto,
      file,
      onProgress,
    }: {
      dto: RequestUploadDto;
      file: File;
      onProgress?: (pct: number) => void;
    }) => uploadService.uploadFile(dto, file, onProgress),
    onSuccess: () => success('Upload complete', 'Processing will begin shortly.'),
    onError: (err) => error('Upload failed', extractApiError(err)),
  });
}

export function useUploadStatus(id: string, enabled = true) {
  return useQuery({
    queryKey: queryKeys.uploads.detail(id),
    queryFn: () => uploadService.getUploadStatus(id),
    enabled: !!id && enabled,
    // Poll every 3s while status is PROCESSING or PENDING
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      if (status === 'PROCESSING' || status === 'PENDING') return 3_000;
      return false;
    },
  });
}