'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { playlistsService } from '@/services/playlists.service';
import { queryKeys } from '@/lib/constants/query-keys';
import { STALE_TIME } from '@/lib/constants';
import { useToast } from '@/providers/toast-provider';
import { extractApiError } from '@/lib/utils';
import type {
  AddTrackToPlaylistDto,
  CreatePlaylistDto,
  PaginatedResult,
  PaginationQuery,
  PlaylistResponse,
  TrackResponse,
  UpdatePlaylistDto,
} from '@/types';

// ─── Queries ──────────────────────────────────────────────────────────────────

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

// ─── Create ───────────────────────────────────────────────────────────────────

export function useCreatePlaylist() {
  const qc = useQueryClient();
  const { success, error } = useToast();

  return useMutation({
    mutationFn: (dto: CreatePlaylistDto) => playlistsService.create(dto),

    // Optimistic: add a temp playlist to the list immediately
    onMutate: async (dto) => {
      await qc.cancelQueries({ queryKey: queryKeys.playlists.mine() });
      const previous = qc.getQueryData<PaginatedResult<PlaylistResponse>>(
        queryKeys.playlists.mine(),
      );

      const optimistic: PlaylistResponse = {
        id: `temp-${Date.now()}`,
        title: dto.title,
        description: dto.description ?? null,
        coverUrl: null,
        visibility: dto.visibility ?? 'PRIVATE',
        ownerId: '',
        createdAt: new Date().toISOString(),
      };

      if (previous) {
        qc.setQueryData<PaginatedResult<PlaylistResponse>>(queryKeys.playlists.mine(), {
          ...previous,
          items: [optimistic, ...previous.items],
          meta: { ...previous.meta, totalItems: previous.meta.totalItems + 1 },
        });
      }
      return { previous };
    },

    onError: (err, _vars, ctx) => {
      if (ctx?.previous) qc.setQueryData(queryKeys.playlists.mine(), ctx.previous);
      error('Failed to create playlist', extractApiError(err));
    },

    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.playlists.mine() });
      success('Playlist created');
    },
  });
}

// ─── Update (rename, description, visibility) ─────────────────────────────────

export function useUpdatePlaylist(id: string) {
  const qc = useQueryClient();
  const { success, error } = useToast();

  return useMutation({
    mutationFn: (dto: UpdatePlaylistDto) => playlistsService.update(id, dto),

    onMutate: async (dto) => {
      await qc.cancelQueries({ queryKey: queryKeys.playlists.detail(id) });
      await qc.cancelQueries({ queryKey: queryKeys.playlists.mine() });

      const prevDetail = qc.getQueryData<PlaylistResponse>(queryKeys.playlists.detail(id));
      const prevList   = qc.getQueryData<PaginatedResult<PlaylistResponse>>(queryKeys.playlists.mine());

      if (prevDetail) {
        qc.setQueryData<PlaylistResponse>(queryKeys.playlists.detail(id), {
          ...prevDetail,
          ...dto,
        });
      }
      if (prevList) {
        qc.setQueryData<PaginatedResult<PlaylistResponse>>(queryKeys.playlists.mine(), {
          ...prevList,
          items: prevList.items.map((p) =>
            p.id === id ? { ...p, ...dto } : p,
          ),
        });
      }
      return { prevDetail, prevList };
    },

    onError: (err, _vars, ctx) => {
      if (ctx?.prevDetail) qc.setQueryData(queryKeys.playlists.detail(id), ctx.prevDetail);
      if (ctx?.prevList)   qc.setQueryData(queryKeys.playlists.mine(), ctx.prevList);
      error('Failed to update playlist', extractApiError(err));
    },

    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.playlists.detail(id) });
      qc.invalidateQueries({ queryKey: queryKeys.playlists.mine() });
      success('Playlist updated');
    },
  });
}

// ─── Delete ───────────────────────────────────────────────────────────────────

export function useDeletePlaylist() {
  const qc = useQueryClient();
  const { success, error } = useToast();

  return useMutation({
    mutationFn: (id: string) => playlistsService.delete(id),

    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: queryKeys.playlists.mine() });
      const previous = qc.getQueryData<PaginatedResult<PlaylistResponse>>(
        queryKeys.playlists.mine(),
      );
      if (previous) {
        qc.setQueryData<PaginatedResult<PlaylistResponse>>(queryKeys.playlists.mine(), {
          ...previous,
          items: previous.items.filter((p) => p.id !== id),
          meta: { ...previous.meta, totalItems: previous.meta.totalItems - 1 },
        });
      }
      return { previous };
    },

    onError: (err, _id, ctx) => {
      if (ctx?.previous) qc.setQueryData(queryKeys.playlists.mine(), ctx.previous);
      error('Failed to delete playlist', extractApiError(err));
    },

    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.playlists.mine() });
      success('Playlist deleted');
    },
  });
}

// ─── Add track ────────────────────────────────────────────────────────────────

export function useAddTrackToPlaylist(playlistId: string) {
  const qc = useQueryClient();
  const { success, error } = useToast();

  return useMutation({
    mutationFn: (dto: AddTrackToPlaylistDto) => playlistsService.addTrack(playlistId, dto),

    onSuccess: () => {
      // Invalidate detail so the track list refreshes
      qc.invalidateQueries({ queryKey: queryKeys.playlists.detail(playlistId) });
      success('Added to playlist');
    },
    onError: (err) => error('Failed to add track', extractApiError(err)),
  });
}

// ─── Remove track (optimistic) ────────────────────────────────────────────────

export function useRemoveTrackFromPlaylist(playlistId: string) {
  const qc = useQueryClient();
  const { success, error } = useToast();

  return useMutation({
    mutationFn: (trackId: string) => playlistsService.removeTrack(playlistId, trackId),

    onMutate: async (trackId) => {
      await qc.cancelQueries({ queryKey: queryKeys.playlists.detail(playlistId) });
      const previous = qc.getQueryData<PlaylistWithTracks>(queryKeys.playlists.detail(playlistId));

      if (previous?.tracks) {
        qc.setQueryData<PlaylistWithTracks>(queryKeys.playlists.detail(playlistId), {
          ...previous,
          tracks: previous.tracks.filter((pt) => pt.track.id !== trackId),
        });
      }
      return { previous };
    },

    onError: (err, _trackId, ctx) => {
      if (ctx?.previous) qc.setQueryData(queryKeys.playlists.detail(playlistId), ctx.previous);
      error('Failed to remove track', extractApiError(err));
    },

    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.playlists.detail(playlistId) });
      success('Removed from playlist');
    },
  });
}

// ─── Reorder track (optimistic) ───────────────────────────────────────────────

export function useReorderPlaylistTrack(playlistId: string) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ trackId, position }: { trackId: string; position: number }) =>
      playlistsService.reorderTrack(playlistId, trackId, { position }),

    onMutate: async ({ trackId, position }) => {
      await qc.cancelQueries({ queryKey: queryKeys.playlists.detail(playlistId) });
      const previous = qc.getQueryData<PlaylistWithTracks>(queryKeys.playlists.detail(playlistId));

      if (previous?.tracks) {
        const tracks = [...previous.tracks];
        const fromIdx = tracks.findIndex((pt) => pt.track.id === trackId);
        if (fromIdx !== -1) {
          const [moved] = tracks.splice(fromIdx, 1);
          tracks.splice(position, 0, moved);
          qc.setQueryData<PlaylistWithTracks>(queryKeys.playlists.detail(playlistId), {
            ...previous,
            tracks,
          });
        }
      }
      return { previous };
    },

    onError: (_err, _vars, ctx) => {
      if (ctx?.previous) qc.setQueryData(queryKeys.playlists.detail(playlistId), ctx.previous);
    },

    onSettled: () => {
      qc.invalidateQueries({ queryKey: queryKeys.playlists.detail(playlistId) });
    },
  });
}

// ─── Local type for the detail response that includes tracks ──────────────────
// The backend returns PlaylistTrack rows nested under GET /playlists/:id
// We type-assert using this extended shape.
export interface PlaylistTrackEntry {
  track: TrackResponse;
  addedAt: string;
  position: number;
}

export interface PlaylistWithTracks extends PlaylistResponse {
  tracks?: PlaylistTrackEntry[];
}
