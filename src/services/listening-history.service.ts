/**
 * Listening History Service
 * Endpoints:
 *  GET /listening-history  (authenticated)
 */

import { apiGet } from "@/lib/api/http-client";
import type {
  ListeningHistoryResponse,
  PaginatedResult,
  PaginationQuery,
} from "@/types";

export const listeningHistoryService = {
  findOwn: (
    query?: PaginationQuery
  ): Promise<PaginatedResult<ListeningHistoryResponse>> =>
    apiGet<PaginatedResult<ListeningHistoryResponse>>("/listening-history", {
      params: query,
    }),
};
