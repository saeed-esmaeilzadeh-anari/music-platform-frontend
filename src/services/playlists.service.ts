/**
 * Playlists Service
 * Endpoints:
 *  POST   /playlists                              (authenticated)
 *  GET    /playlists/me                           (authenticated)
 *  GET    /playlists/:id                          (public, private requires ownership)
 *  PATCH  /playlists/:id                          (owner)
 *  DELETE /playlists/:id                          (owner)
 *  POST   /playlists/:id/tracks                   (owner)
 *  DELETE /playlists/:id/tracks/:trackId          (owner)
 *  PATCH  /playlists/:id/tracks/:trackId/position (owner)
 */

import { apiGet, apiPost, apiPatch, apiDelete } from "@/lib/api/http-client";
import type {
  PlaylistResponse,
  CreatePlaylistDto,
  UpdatePlaylistDto,
  AddTrackToPlaylistDto,
  ReorderPlaylistTrackDto,
  PaginatedResult,
  PaginationQuery,
} from "@/types";

export const playlistsService = {
  create: (dto: CreatePlaylistDto): Promise<PlaylistResponse> =>
    apiPost<PlaylistResponse>("/playlists", dto),

  findOwn: (
    query?: PaginationQuery
  ): Promise<PaginatedResult<PlaylistResponse>> =>
    apiGet<PaginatedResult<PlaylistResponse>>("/playlists/me", {
      params: query,
    }),

  findById: (id: string): Promise<PlaylistResponse> =>
    apiGet<PlaylistResponse>(`/playlists/${id}`),

  update: (id: string, dto: UpdatePlaylistDto): Promise<PlaylistResponse> =>
    apiPatch<PlaylistResponse>(`/playlists/${id}`, dto),

  delete: (id: string): Promise<void> => apiDelete<void>(`/playlists/${id}`),

  addTrack: (id: string, dto: AddTrackToPlaylistDto): Promise<void> =>
    apiPost<void>(`/playlists/${id}/tracks`, dto),

  removeTrack: (id: string, trackId: string): Promise<void> =>
    apiDelete<void>(`/playlists/${id}/tracks/${trackId}`),

  reorderTrack: (
    id: string,
    trackId: string,
    dto: ReorderPlaylistTrackDto
  ): Promise<void> =>
    apiPatch<void>(`/playlists/${id}/tracks/${trackId}/position`, dto),
};
