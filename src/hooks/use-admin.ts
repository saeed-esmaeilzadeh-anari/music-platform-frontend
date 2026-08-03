"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { adminService } from "@/services/admin.service";
import { usersService } from "@/services/users.service";
import { genresService } from "@/services/genres.service";
import { queryKeys } from "@/lib/constants/query-keys";
import { STALE_TIME } from "@/lib/constants";
import { useToast } from "@/providers/toast-provider";
import { extractApiError } from "@/lib/utils";
import type {
  CreateGenreDto,
  PaginationQuery,
  UpdateGenreDto,
  UpdateUserStatusDto,
} from "@/types";

// ─── Dashboard ────────────────────────────────────────────────────────────────

export function useAdminDashboard() {
  return useQuery({
    queryKey: queryKeys.admin.dashboard(),
    queryFn: () => adminService.getDashboardStats(),
    staleTime: STALE_TIME.STANDARD,
  });
}

// ─── User management ──────────────────────────────────────────────────────────

export function useAdminUsers(query?: PaginationQuery) {
  return useQuery({
    queryKey: queryKeys.users.all(query),
    queryFn: () => usersService.findAll(query),
    staleTime: STALE_TIME.SHORT,
  });
}

export function useUpdateUserStatus() {
  const qc = useQueryClient();
  const { success, error } = useToast();
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateUserStatusDto }) =>
      adminService.updateUserStatus(id, dto),
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: ["users"] });
      success(
        variables.dto.status === "SUSPENDED"
          ? "کاربر تعلیق شد"
          : "کاربر فعال شد"
      );
    },
    onError: (err) => error("عملیات ناموفق بود", extractApiError(err)),
  });
}

export function useDeleteUser() {
  const qc = useQueryClient();
  const { success, error } = useToast();
  return useMutation({
    mutationFn: (id: string) => usersService.deleteById(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["users"] });
      success("کاربر حذف شد");
    },
    onError: (err) => error("حذف کاربر ناموفق بود", extractApiError(err)),
  });
}

// ─── Genre management ─────────────────────────────────────────────────────────

export function useCreateGenre() {
  const qc = useQueryClient();
  const { success, error } = useToast();
  return useMutation({
    mutationFn: (dto: CreateGenreDto) => genresService.create(dto),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.genres.all() });
      success("ژانر ایجاد شد");
    },
    onError: (err) => error("ایجاد ژانر ناموفق بود", extractApiError(err)),
  });
}

export function useUpdateGenre() {
  const qc = useQueryClient();
  const { success, error } = useToast();
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateGenreDto }) =>
      genresService.update(id, dto),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.genres.all() });
      success("ژانر ویرایش شد");
    },
    onError: (err) => error("ویرایش ژانر ناموفق بود", extractApiError(err)),
  });
}

export function useDeleteGenre() {
  const qc = useQueryClient();
  const { success, error } = useToast();
  return useMutation({
    mutationFn: (id: string) => genresService.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.genres.all() });
      success("ژانر حذف شد");
    },
    onError: (err) => error("حذف ژانر ناموفق بود", extractApiError(err)),
  });
}
