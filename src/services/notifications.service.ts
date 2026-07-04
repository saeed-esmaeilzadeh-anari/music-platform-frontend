/**
 * Notifications Service
 * Endpoints:
 *  GET   /notifications              (authenticated)
 *  GET   /notifications/unread-count (authenticated)
 *  PATCH /notifications/:id/read     (authenticated)
 *  PATCH /notifications/read-all     (authenticated)
 */

import { apiGet, apiPatch } from "@/lib/api/http-client";
import type {
  NotificationResponse,
  UnreadCountResponse,
  PaginatedResult,
  PaginationQuery,
} from "@/types";

export const notificationsService = {
  findOwn: (
    query?: PaginationQuery
  ): Promise<PaginatedResult<NotificationResponse>> =>
    apiGet<PaginatedResult<NotificationResponse>>("/notifications", {
      params: query,
    }),

  getUnreadCount: (): Promise<UnreadCountResponse> =>
    apiGet<UnreadCountResponse>("/notifications/unread-count"),

  markRead: (id: string): Promise<NotificationResponse> =>
    apiPatch<NotificationResponse>(`/notifications/${id}/read`),

  markAllRead: (): Promise<void> => apiPatch<void>("/notifications/read-all"),
};
