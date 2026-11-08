/**
 * Search Service
 * Endpoints:
 *  GET /search?q=...&type=...&page=...&limit=...  (public)
 *
 * Results are "playable": tracks carry audio/cover/duration/artist refs so
 * a hit can be queued and played without a follow-up fetch.
 */

import { apiGet } from "@/lib/api/http-client";
import type { SearchResultV2, SearchQuery } from "@/types";

export const searchService = {
  search: (query: SearchQuery): Promise<SearchResultV2> =>
    apiGet<SearchResultV2>("/search", { params: query }),
};
