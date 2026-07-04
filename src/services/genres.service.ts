/**
 * Genres Service
 * Endpoints:
 *  GET    /genres           (public)
 *  GET    /genres/:id       (public)
 *  POST   /genres           (ADMIN)
 *  PATCH  /genres/:id       (ADMIN)
 *  DELETE /genres/:id       (ADMIN)
 */

import { apiGet, apiPost, apiPatch, apiDelete } from "@/lib/api/http-client";
import type { GenreResponse, CreateGenreDto, UpdateGenreDto } from "@/types";

export const genresService = {
  findAll: (): Promise<GenreResponse[]> => apiGet<GenreResponse[]>("/genres"),

  findById: (id: string): Promise<GenreResponse> =>
    apiGet<GenreResponse>(`/genres/${id}`),

  create: (dto: CreateGenreDto): Promise<GenreResponse> =>
    apiPost<GenreResponse>("/genres", dto),

  update: (id: string, dto: UpdateGenreDto): Promise<GenreResponse> =>
    apiPatch<GenreResponse>(`/genres/${id}`, dto),

  delete: (id: string): Promise<void> => apiDelete<void>(`/genres/${id}`),
};
