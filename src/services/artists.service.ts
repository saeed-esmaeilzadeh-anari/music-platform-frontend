/**
 * Artists Service
 * Endpoints:
 *  GET   /artists           (public)
 *  GET   /artists/me        (authenticated current user, nullable)
 *  GET   /artists/:id       (public)
 *  POST  /artists           (LISTENER onboarding, ARTIST, ADMIN)
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

  findMine: (): Promise<ArtistResponse | null> =>
    apiGet<ArtistResponse | null>("/artists/me"),

  findById: (id: string): Promise<ArtistResponse> =>
    apiGet<ArtistResponse>(`/artists/${id}`),

  create: (dto: CreateArtistDto): Promise<ArtistResponse> =>
    apiPost<ArtistResponse>("/artists", dto),

  update: (id: string, dto: UpdateArtistDto): Promise<ArtistResponse> =>
    apiPatch<ArtistResponse>(`/artists/${id}`, dto),
};
