'use client';

import { useMemo } from 'react';
import { useArtists } from '@/hooks/use-artists';
import { useCurrentUser } from '@/hooks/use-auth';
import type { ArtistResponse } from '@/types';

/**
 * useArtistProfile
 *
 * Returns the artist profile belonging to the currently-authenticated user.
 * The backend has no GET /artists/me endpoint, so we fetch the artist list
 * and match by userId. This works because the list is short for artist accounts
 * (they own exactly one profile) and is cached at the STANDARD stale time.
 *
 * Returns null when the user has no artist profile (LISTENER role).
 */
export function useArtistProfile(): {
  artist: ArtistResponse | null;
  isLoading: boolean;
} {
  const user = useCurrentUser();
  // Fetch with a large limit — in practice an artist owns exactly one profile,
  // but we search the list since there's no /artists/me endpoint.
  const { data, isLoading } = useArtists({ limit: 100 });

  const artist = useMemo(() => {
    if (!user || !data?.items) return null;
    return data.items.find((a) => a.userId === user.id) ?? null;
  }, [user, data?.items]);

  return { artist, isLoading };
}