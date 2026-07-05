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
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["users"] });
      success("User status updated");
    },
    onError: (err) => error("Failed", extractApiError(err)),
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
      success("Genre created");
    },
    onError: (err) => error("Failed to create genre", extractApiError(err)),
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
      success("Genre updated");
    },
    onError: (err) => error("Failed to update genre", extractApiError(err)),
  });
}

export function useDeleteGenre() {
  const qc = useQueryClient();
  const { success, error } = useToast();
  return useMutation({
    mutationFn: (id: string) => genresService.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.genres.all() });
      success("Genre deleted");
    },
    onError: (err) => error("Failed to delete genre", extractApiError(err)),
  });
}
