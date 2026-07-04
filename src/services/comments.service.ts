/**
 * Comments Service
 * Endpoints:
 *  POST   /comments                     (authenticated)
 *  GET    /comments?targetType=&targetId= (public)
 *  PATCH  /comments/:id                 (author)
 *  DELETE /comments/:id                 (author, moderator, admin)
 */

import { apiGet, apiPost, apiPatch, apiDelete } from "@/lib/api/http-client";
import type {
  CommentResponse,
  CreateCommentDto,
  UpdateCommentDto,
  CommentTargetType,
  PaginatedResult,
  PaginationQuery,
} from "@/types";

export interface CommentsQuery extends PaginationQuery {
  targetType: CommentTargetType;
  targetId: string;
}

export const commentsService = {
  create: (dto: CreateCommentDto): Promise<CommentResponse> =>
    apiPost<CommentResponse>("/comments", dto),

  findByTarget: (
    query: CommentsQuery
  ): Promise<PaginatedResult<CommentResponse>> =>
    apiGet<PaginatedResult<CommentResponse>>("/comments", { params: query }),

  update: (id: string, dto: UpdateCommentDto): Promise<CommentResponse> =>
    apiPatch<CommentResponse>(`/comments/${id}`, dto),

  delete: (id: string): Promise<void> => apiDelete<void>(`/comments/${id}`),
};
