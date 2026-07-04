/**
 * Users Service
 * Endpoints:
 *  GET    /users/me
 *  PATCH  /users/me
 *  DELETE /users/me
 *  GET    /users            (ADMIN, MODERATOR)
 *  GET    /users/:id        (ADMIN, MODERATOR)
 *  DELETE /users/:id        (ADMIN)
 */

import { apiGet, apiPatch, apiDelete } from "@/lib/api/http-client";
import type {
  UserResponse,
  UpdateUserDto,
  PaginatedResult,
  PaginationQuery,
} from "@/types";

export const usersService = {
  getMe: (): Promise<UserResponse> => apiGet<UserResponse>("/users/me"),

  updateMe: (dto: UpdateUserDto): Promise<UserResponse> =>
    apiPatch<UserResponse>("/users/me", dto),

  deleteMe: (): Promise<void> => apiDelete<void>("/users/me"),

  // Admin endpoints
  findAll: (query?: PaginationQuery): Promise<PaginatedResult<UserResponse>> =>
    apiGet<PaginatedResult<UserResponse>>("/users", { params: query }),

  findById: (id: string): Promise<UserResponse> =>
    apiGet<UserResponse>(`/users/${id}`),

  deleteById: (id: string): Promise<void> => apiDelete<void>(`/users/${id}`),
};
