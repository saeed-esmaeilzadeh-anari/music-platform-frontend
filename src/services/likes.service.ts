/**
 * Likes Service
 * Endpoints:
 *  POST   /likes                                       (authenticated)
 *  DELETE /likes?targetType=&targetId=                 (authenticated)
 *  GET    /likes/count?targetType=&targetId=           (public)
 */

import { apiGet, apiPost, apiDelete } from "@/lib/api/http-client";
import type {
  LikeResponse,
  CreateLikeDto,
  LikeTargetType,
  LikeCountResponse,
} from "@/types";

export const likesService = {
  like: (dto: CreateLikeDto): Promise<LikeResponse> =>
    apiPost<LikeResponse>("/likes", dto),

  unlike: (targetType: LikeTargetType, targetId: string): Promise<void> =>
    apiDelete<void>("/likes", { params: { targetType, targetId } }),

  getCount: (targetType: LikeTargetType,targetId: string): Promise<LikeCountResponse> =>
    apiGet<LikeCountResponse>("/likes/count", {
      params: { targetType, targetId },
    }),
};
