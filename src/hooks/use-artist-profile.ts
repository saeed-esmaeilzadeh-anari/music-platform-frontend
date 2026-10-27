'use client';

import { useQuery } from '@tanstack/react-query';
import { artistsService } from '@/services/artists.service';
import { useCurrentUser } from '@/hooks/use-auth';
import { queryKeys, STALE_TIME } from '@/lib/constants';
import type { ArtistResponse } from '@/types';

export function useArtistProfile(): {
  artist: ArtistResponse | null;
  isLoading: boolean;
  isError: boolean;
  refetch: () => Promise<unknown>;
} {
  const user = useCurrentUser();
  const query = useQuery({
    queryKey: queryKeys.artists.mine(),
    queryFn: () => artistsService.findMine(),
    enabled: !!user?.id,
    staleTime: STALE_TIME.INSTANT,
  });

  return {
    artist: query.data ?? null,
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: query.refetch,
  };
}
