/**
 * Reports Service
 * Endpoints:
 *  POST /reports   (authenticated — one report per user per target)
 */

import { apiPost } from "@/lib/api/http-client";
import type { CreateReportDto } from "@/types";

export const reportsService = {
  create: (dto: CreateReportDto): Promise<{ id: string; status: string }> =>
    apiPost<{ id: string; status: string }>("/reports", dto),
};
