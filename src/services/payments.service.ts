/**
 * Payments Service
 * Endpoints:
 *  GET /payments/history  (authenticated)
 */

import { apiGet } from "@/lib/api/http-client";
import type {
  PaymentResponse,
  PaginatedResult,
  PaginationQuery,
} from "@/types";

export const paymentsService = {
  getHistory: (
    query?: PaginationQuery
  ): Promise<PaginatedResult<PaymentResponse>> =>
    apiGet<PaginatedResult<PaymentResponse>>("/payments/history", {
      params: query,
    }),
};
