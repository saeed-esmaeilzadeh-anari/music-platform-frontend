/**
 * Albums Service
 * Endpoints:
 *  POST   /artists/:artistId/albums   (ARTIST owner, ADMIN)
 *  GET    /albums                     (public)
 *  GET    /albums/:id                 (public)
 *  PATCH  /albums/:id                 (ARTIST owner, ADMIN)
 *  DELETE /albums/:id                 (ARTIST owner, ADMIN)
 */

import { apiGet, apiPost, apiPatch, apiDelete } from "@/lib/api/http-client";
import type {
  AlbumResponse,
  CreateAlbumDto,
  UpdateAlbumDto,
  AlbumQuery,
  PaginatedResult,
} from "@/types";

export const albumsService = {
  create: (artistId: string, dto: CreateAlbumDto): Promise<AlbumResponse> =>
    apiPost<AlbumResponse>(`/artists/${artistId}/albums`, dto),

  findAll: (query?: AlbumQuery): Promise<PaginatedResult<AlbumResponse>> =>
    apiGet<PaginatedResult<AlbumResponse>>("/albums", { params: query }),

  findById: (id: string): Promise<AlbumResponse> =>
    apiGet<AlbumResponse>(`/albums/${id}`),

  update: (id: string, dto: UpdateAlbumDto): Promise<AlbumResponse> =>
    apiPatch<AlbumResponse>(`/albums/${id}`, dto),

  delete: (id: string): Promise<void> => apiDelete<void>(`/albums/${id}`),
};
