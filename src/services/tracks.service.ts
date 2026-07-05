/**
 * Tracks Service
 * Endpoints:
 *  POST   /artists/:artistId/tracks            (ARTIST, ADMIN)
 *  PATCH  /artists/:artistId/tracks/:trackId   (ARTIST owner, ADMIN)
 *  DELETE /artists/:artistId/tracks/:trackId   (ARTIST owner, ADMIN)
 *  GET    /tracks                              (public)
 *  GET    /tracks/:id                          (public)
 *  POST   /tracks/:id/play                     (authenticated)
 */

import { apiGet, apiPost, apiPatch, apiDelete } from "@/lib/api/http-client";
import type {
  TrackResponse,
  CreateTrackDto,
  UpdateTrackDto,
  TrackQuery,
  RegisterPlayDto,
  PaginatedResult,
} from "@/types";

export const tracksService = {
  // Artist-scoped mutations
  create: (artistId: string, dto: CreateTrackDto): Promise<TrackResponse> =>
    apiPost<TrackResponse>(`/artists/${artistId}/tracks`, dto),

  update: (
    artistId: string,
    trackId: string,
    dto: UpdateTrackDto
  ): Promise<TrackResponse> =>
    apiPatch<TrackResponse>(`/artists/${artistId}/tracks/${trackId}`, dto),

  delete: (artistId: string, trackId: string): Promise<void> =>
    apiDelete<void>(`/artists/${artistId}/tracks/${trackId}`),

  // Public browse
  findAll: (query?: TrackQuery): Promise<PaginatedResult<TrackResponse>> =>
    apiGet<PaginatedResult<TrackResponse>>("/tracks", { params: query }),

  findById: (id: string): Promise<TrackResponse> =>
    apiGet<TrackResponse>(`/tracks/${id}`),

  // Play tracking (authenticated, no response body on success - 204)
  registerPlay: (id: string, dto?: RegisterPlayDto): Promise<void> =>
    apiPost<void>(`/tracks/${id}/play`, dto ?? {}),
};
