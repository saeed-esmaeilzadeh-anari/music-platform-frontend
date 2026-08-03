"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { playlistsService } from "@/services/playlists.service";
import { queryKeys } from "@/lib/constants/query-keys";
import { STALE_TIME } from "@/lib/constants";
import { useToast } from "@/providers/toast-provider";
import { extractApiError } from "@/lib/utils/index";
import type {
  AddTrackToPlaylistDto,
  CreatePlaylistDto,
  PaginationQuery,
  UpdatePlaylistDto,
} from "@/types";

export function useMyPlaylists(query?: PaginationQuery) {
  return useQuery({
    queryKey: queryKeys.playlists.mine(query),
    queryFn: () => playlistsService.findOwn(query),
    staleTime: STALE_TIME.STANDARD,
  });
}

export function usePlaylist(id: string) {
  return useQuery({
    queryKey: queryKeys.playlists.detail(id),
    queryFn: () => playlistsService.findById(id),
    staleTime: STALE_TIME.STANDARD,
    enabled: !!id,
  });
}

export function useCreatePlaylist() {
  const qc = useQueryClient();
  const { success, error } = useToast();

  return useMutation({
    mutationFn: (dto: CreatePlaylistDto) => playlistsService.create(dto),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.playlists.mine() });
      success("Playlist created");
    },
    onError: (err) => error("Failed to create playlist", extractApiError(err)),
  });
}

export function useUpdatePlaylist(id: string) {
  const qc = useQueryClient();
  const { success, error } = useToast();

  return useMutation({
    mutationFn: (dto: UpdatePlaylistDto) => playlistsService.update(id, dto),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.playlists.detail(id) });
      qc.invalidateQueries({ queryKey: queryKeys.playlists.mine() });
      success("Playlist updated");
    },
    onError: (err) => error("Failed to update playlist", extractApiError(err)),
  });
}

export function useDeletePlaylist() {
  const qc = useQueryClient();
  const { success, error } = useToast();

  return useMutation({
    mutationFn: (id: string) => playlistsService.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.playlists.mine() });
      success("Playlist deleted");
    },
    onError: (err) => error("Failed to delete playlist", extractApiError(err)),
  });
}

export function useAddTrackToPlaylist(playlistId: string) {
  const qc = useQueryClient();
  const { success, error } = useToast();

  return useMutation({
    mutationFn: (dto: AddTrackToPlaylistDto) =>
      playlistsService.addTrack(playlistId, dto),
    onSuccess: () => {
      qc.invalidateQueries({
        queryKey: queryKeys.playlists.detail(playlistId),
      });
      success("Added to playlist");
    },
    onError: (err) => error("Failed to add track", extractApiError(err)),
  });
}

export function useRemoveTrackFromPlaylist(playlistId: string) {
  const qc = useQueryClient();
  const { success, error } = useToast();

  return useMutation({
    mutationFn: (trackId: string) =>
      playlistsService.removeTrack(playlistId, trackId),
    onSuccess: () => {
      qc.invalidateQueries({
        queryKey: queryKeys.playlists.detail(playlistId),
      });
      success("Removed from playlist");
    },
    onError: (err) => error("Failed to remove track", extractApiError(err)),
  });
}

export function useReorderPlaylistTrack(playlistId: string) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({
      trackId,
      position,
    }: {
      trackId: string;
      position: number;
    }) => playlistsService.reorderTrack(playlistId, trackId, { position }),
    onSuccess: () => {
      qc.invalidateQueries({
        queryKey: queryKeys.playlists.detail(playlistId),
      });
    },
  });
}
