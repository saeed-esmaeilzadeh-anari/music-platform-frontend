"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { favoritesService } from "@/services/favorites.service";
import { genresService } from "@/services/genres.service";
import { searchService } from "@/services/search.service";
import {
  commentsService,
  type CommentsQuery,
} from "@/services/comments.service";
import { likesService } from "@/services/likes.service";
import { queryKeys } from "@/lib/constants/query-keys";
import { STALE_TIME } from "@/lib/constants";
import { useToast } from "@/providers/toast-provider";
import { extractApiError } from "@/lib/utils/index";
import type {
  CreateCommentDto,
  CreateLikeDto,
  LikeTargetType,
  PaginationQuery,
  SearchQuery,
  UpdateCommentDto,
} from "@/types";

// ─── Favorites ────────────────────────────────────────────────────────────────

export function useFavorites(query?: PaginationQuery) {
  return useQuery({
    queryKey: queryKeys.favorites.all(query),
    queryFn: () => favoritesService.findAll(query),
    staleTime: STALE_TIME.STANDARD,
  });
}

export function useAddFavorite() {
  const qc = useQueryClient();
  const { success, error } = useToast();
  return useMutation({
    mutationFn: (trackId: string) => favoritesService.add({ trackId }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.favorites.all() });
      success("Added to favorites");
    },
    onError: (err) => error("Failed", extractApiError(err)),
  });
}

export function useRemoveFavorite() {
  const qc = useQueryClient();
  const { success, error } = useToast();
  return useMutation({
    mutationFn: (trackId: string) => favoritesService.remove(trackId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.favorites.all() });
      success("Removed from favorites");
    },
    onError: (err) => error("Failed", extractApiError(err)),
  });
}

// ─── Genres ───────────────────────────────────────────────────────────────────

export function useGenres() {
  return useQuery({
    queryKey: queryKeys.genres.all(),
    queryFn: () => genresService.findAll(),
    staleTime: STALE_TIME.STATIC,
  });
}

export function useGenre(id: string) {
  return useQuery({
    queryKey: queryKeys.genres.detail(id),
    queryFn: () => genresService.findById(id),
    staleTime: STALE_TIME.STATIC,
    enabled: !!id,
  });
}

// ─── Search ───────────────────────────────────────────────────────────────────

export function useSearch(query: SearchQuery) {
  return useQuery({
    queryKey: queryKeys.search.results(query),
    queryFn: () => searchService.search(query),
    staleTime: STALE_TIME.SHORT,
    enabled: query.q.trim().length > 0,
  });
}

// ─── Comments ─────────────────────────────────────────────────────────────────

export function useComments(query: CommentsQuery) {
  return useQuery({
    queryKey: queryKeys.comments.byTarget(
      query.targetType,
      query.targetId,
      query
    ),
    queryFn: () => commentsService.findByTarget(query),
    staleTime: STALE_TIME.SHORT,
    enabled: !!query.targetId,
  });
}

export function useCreateComment() {
  const qc = useQueryClient();
  const { success, error } = useToast();
  return useMutation({
    mutationFn: (dto: CreateCommentDto) => commentsService.create(dto),
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({
        queryKey: queryKeys.comments.byTarget(
          variables.targetType,
          variables.targetId
        ),
      });
    },
    onError: (err) => error("Failed to post comment", extractApiError(err)),
  });
}

export function useUpdateComment() {
  const qc = useQueryClient();
  const { success, error } = useToast();
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateCommentDto }) =>
      commentsService.update(id, dto),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["comments"] });
      success("Comment updated");
    },
    onError: (err) => error("Failed to update comment", extractApiError(err)),
  });
}

export function useDeleteComment() {
  const qc = useQueryClient();
  const { success, error } = useToast();
  return useMutation({
    mutationFn: (id: string) => commentsService.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["comments"] });
      success("Comment deleted");
    },
    onError: (err) => error("Failed to delete comment", extractApiError(err)),
  });
}

// ─── Likes ────────────────────────────────────────────────────────────────────

export function useLikeCount(targetType: LikeTargetType, targetId: string) {
  return useQuery({
    queryKey: queryKeys.likes.count(targetType, targetId),
    queryFn: () => likesService.getCount(targetType, targetId),
    staleTime: STALE_TIME.SHORT,
    enabled: !!targetId,
  });
}

export function useLike() {
  const qc = useQueryClient();
  const { error } = useToast();
  return useMutation({
    mutationFn: (dto: CreateLikeDto) => likesService.like(dto),
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({
        queryKey: queryKeys.likes.count(
          variables.targetType,
          variables.targetId
        ),
      });
    },
    onError: (err) => error("Failed", extractApiError(err)),
  });
}

export function useUnlike() {
  const qc = useQueryClient();
  const { error } = useToast();
  return useMutation({
    mutationFn: ({
      targetType,
      targetId,
    }: {
      targetType: LikeTargetType;
      targetId: string;
    }) => likesService.unlike(targetType, targetId),
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({
        queryKey: queryKeys.likes.count(
          variables.targetType,
          variables.targetId
        ),
      });
    },
    onError: (err) => error("Failed", extractApiError(err)),
  });
}
