/**
 * Artists Service
 * Endpoints:
 *  GET   /artists           (public)
 *  GET   /artists/:id       (public)
 *  POST  /artists           (ARTIST, ADMIN)
 *  PATCH /artists/:id       (ARTIST owner, ADMIN)
 */

import { apiGet, apiPost, apiPatch } from "@/lib/api/http-client";
import type {
  ArtistResponse,
  CreateArtistDto,
  UpdateArtistDto,
  PaginatedResult,
  PaginationQuery,
} from "@/types";

export const artistsService = {
  findAll: (
    query?: PaginationQuery
  ): Promise<PaginatedResult<ArtistResponse>> =>
    apiGet<PaginatedResult<ArtistResponse>>("/artists", { params: query }),

  findById: (id: string): Promise<ArtistResponse> =>
    apiGet<ArtistResponse>(`/artists/${id}`),

  create: (dto: CreateArtistDto): Promise<ArtistResponse> =>
    apiPost<ArtistResponse>("/artists", dto),

  update: (id: string, dto: UpdateArtistDto): Promise<ArtistResponse> =>
    apiPatch<ArtistResponse>(`/artists/${id}`, dto),
};
