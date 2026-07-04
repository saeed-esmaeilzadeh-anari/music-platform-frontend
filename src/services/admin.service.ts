/**
 * Admin Service
 * Endpoints:
 *  GET   /admin/dashboard              (ADMIN)
 *  PATCH /admin/users/:id/status       (ADMIN)
 */

import { apiGet, apiPatch } from "@/lib/api/http-client";
import type { AdminDashboardStats, UpdateUserStatusDto } from "@/types";

export const adminService = {
  getDashboardStats: (): Promise<AdminDashboardStats> =>
    apiGet<AdminDashboardStats>("/admin/dashboard"),

  updateUserStatus: (id: string, dto: UpdateUserStatusDto): Promise<void> =>
    apiPatch<void>(`/admin/users/${id}/status`, dto),
};
