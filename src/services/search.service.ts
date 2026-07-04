/**
 * Search Service
 * Endpoints:
 *  GET /search?q=...&type=...&page=...&limit=...  (public)
 */

import { apiGet } from "@/lib/api/http-client";
import type { SearchResult, SearchQuery } from "@/types";

export const searchService = {
  search: (query: SearchQuery): Promise<SearchResult> =>
    apiGet<SearchResult>("/search", { params: query }),
};
