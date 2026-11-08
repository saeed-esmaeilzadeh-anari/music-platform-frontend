/**
 * Recommendations Service
 * Endpoints:
 *  GET /recommendations?limit=   (public — personalized when a token is attached)
 */

import { apiGet } from "@/lib/api/http-client";
import type { RecommendationsResponse } from "@/types";

export const recommendationsService = {
  get: (limit = 10): Promise<RecommendationsResponse> =>
    apiGet<RecommendationsResponse>("/recommendations", {
      params: { limit },
    }),
};
