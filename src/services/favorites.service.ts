/**
 * Favorites Service
 * Endpoints:
 *  GET    /favorites           (authenticated)
 *  POST   /favorites           (authenticated)
 *  DELETE /favorites/:trackId  (authenticated)
 */

import { apiGet, apiPost, apiDelete } from "@/lib/api/http-client";
import type {
  FavoriteResponse,
  AddFavoriteDto,
  PaginatedResult,
  PaginationQuery,
} from "@/types";

export const favoritesService = {
  findAll: (
    query?: PaginationQuery
  ): Promise<PaginatedResult<FavoriteResponse>> =>
    apiGet<PaginatedResult<FavoriteResponse>>("/favorites", { params: query }),

  add: (dto: AddFavoriteDto): Promise<FavoriteResponse> =>
    apiPost<FavoriteResponse>("/favorites", dto),

  remove: (trackId: string): Promise<void> =>
    apiDelete<void>(`/favorites/${trackId}`),
};
