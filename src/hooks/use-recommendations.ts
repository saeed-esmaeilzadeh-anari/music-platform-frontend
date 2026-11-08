'use client';

import { useQuery } from '@tanstack/react-query';
import { recommendationsService } from '@/services/recommendations.service';
import { queryKeys } from '@/lib/constants/query-keys';

export function useRecommendations(limit = 10) {
  return useQuery({
    queryKey: queryKeys.recommendations.all(limit),
    queryFn: () => recommendationsService.get(limit),
    staleTime: 2 * 60_000,
  });
}
