/**
 * Preferences Service
 * Endpoints:
 *  GET   /users/me/preferences         (authenticated)
 *  PATCH /users/me/preferences         (authenticated)
 *  GET   /notifications/preferences    (authenticated)
 *  PATCH /notifications/preferences    (authenticated)
 */

import { apiGet, apiPatch } from "@/lib/api/http-client";
import type {
  UserPreferencesWire,
  UpdateUserPreferencesDto,
  NotificationPreferencesWire,
  UpdateNotificationPreferencesDto,
} from "@/types";

export const preferencesService = {
  getUserPreferences: (): Promise<UserPreferencesWire> =>
    apiGet<UserPreferencesWire>("/users/me/preferences"),

  updateUserPreferences: (
    dto: UpdateUserPreferencesDto
  ): Promise<UserPreferencesWire> =>
    apiPatch<UserPreferencesWire>("/users/me/preferences", dto),

  getNotificationPreferences: (): Promise<NotificationPreferencesWire> =>
    apiGet<NotificationPreferencesWire>("/notifications/preferences"),

  updateNotificationPreferences: (
    dto: UpdateNotificationPreferencesDto
  ): Promise<NotificationPreferencesWire> =>
    apiPatch<NotificationPreferencesWire>("/notifications/preferences", dto),
};
