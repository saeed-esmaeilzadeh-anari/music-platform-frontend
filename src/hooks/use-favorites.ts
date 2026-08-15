'use client';

/**
 * use-favorites.ts
 *
 * Favorites system for tracks, albums, and artists.
 *
 * Architecture reality:
 *   - Track favorites: backed by the real NestJS API
 *       GET    /favorites          → list of { id, trackId, createdAt }
 *       POST   /favorites          → add { trackId }
 *       DELETE /favorites/:trackId → remove
 *
 *   - Album + Artist favorites: the backend has no endpoints for these.
 *     They are stored in localStorage under 'ms-fav-albums' / 'ms-fav-artists'
 *     and managed entirely client-side with Zustand persist.
 *
 * All three entity types expose the same hook interface so UI components
 * remain agnostic:
 *   const { isFavorited, toggle, isPending } = useIsFavoriteTrack(trackId)
 *   const { isFavorited, toggle, isPending } = useIsFavoriteAlbum(albumId)
 *   const { isFavorited, toggle, isPending } = useIsFavoriteArtist(artistId)
 */

import { useMutation, useQuery, useQueryClient, type InfiniteData } from '@tanstack/react-query';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { favoritesService } from '@/services/favorites.service';
import { tracksService }    from '@/services/tracks.service';
import { queryKeys }        from '@/lib/constants/query-keys';
import { STALE_TIME }       from '@/lib/constants';
import { useToast }         from '@/providers/toast-provider';
import type { FavoriteResponse, PaginatedResult, TrackResponse } from '@/types';

// ─── Track favorites — real API + optimistic updates ─────────────────────────

/** Fetches the raw favorite records (id + trackId). */
export function useFavoriteRecords(query?: { page?: number; limit?: number }) {
  return useQuery({
    queryKey: queryKeys.favorites.all(query),
    queryFn:  () => favoritesService.findAll(query),
    staleTime: STALE_TIME.STANDARD,
  });
}

/**
 * Fetches favorites AND enriches them with full TrackResponse objects.
 * Strategy: get the favorite list, then fetch each track by id in parallel.
 * We use a single compound query key so the cache works correctly.
 */
export function useFavoriteTracks(query?: { page?: number; limit?: number }) {
  return useQuery({
    queryKey: [...queryKeys.favorites.all(query), 'enriched'] as const,
    queryFn: async () => {
      const favorites = await favoritesService.findAll(query);
      if (!favorites.items.length) {
        return { ...favorites, items: [] as TrackResponse[] };
      }
      const tracks = await Promise.all(
        favorites.items.map(fav => tracksService.findById(fav.trackId).catch(() => null)),
      );
      return {
        ...favorites,
        items: tracks.filter((t): t is TrackResponse => t !== null),
      };
    },
    staleTime: STALE_TIME.STANDARD,
  });
}

/** Set of favorited trackIds — used by useIsFavoriteTrack. */
export function useFavoriteTrackIds() {
  return useQuery({
    queryKey: [...queryKeys.favorites.all(), 'ids'] as const,
    queryFn: async () => {
      const all = await favoritesService.findAll({ limit: 500 });
      return new Set(all.items.map(f => f.trackId));
    },
    staleTime: STALE_TIME.STANDARD,
  });
}

export function useAddFavoriteTrack() {
  const qc             = useQueryClient();
  const { error }      = useToast();

  return useMutation({
    mutationFn: (trackId: string) => favoritesService.add({ trackId }),

    onMutate: async (trackId) => {
      const idsKey = [...queryKeys.favorites.all(), 'ids'] as const;
      await qc.cancelQueries({ queryKey: idsKey });
      const prev = qc.getQueryData<Set<string>>(idsKey);

      if (prev) {
        qc.setQueryData<Set<string>>(idsKey, new Set([...prev, trackId]));
      }
      return { prev };
    },

    onError: (err, _trackId, ctx) => {
      if (ctx?.prev) {
        qc.setQueryData([...queryKeys.favorites.all(), 'ids'], ctx.prev);
      }
      error('Failed to add to favorites');
    },

    onSettled: () => {
      qc.invalidateQueries({ queryKey: queryKeys.favorites.all() });
    },
  });
}

export function useRemoveFavoriteTrack() {
  const qc        = useQueryClient();
  const { error } = useToast();

  return useMutation({
    mutationFn: (trackId: string) => favoritesService.remove(trackId),

    onMutate: async (trackId) => {
      const idsKey     = [...queryKeys.favorites.all(), 'ids'] as const;
      const enrichedKey = [...queryKeys.favorites.all(), 'enriched'] as const;

      await qc.cancelQueries({ queryKey: queryKeys.favorites.all() });

      const prevIds      = qc.getQueryData<Set<string>>(idsKey);
      const prevEnriched = qc.getQueryData<PaginatedResult<TrackResponse>>(enrichedKey);

      // Optimistic: remove from id set
      if (prevIds) {
        const next = new Set(prevIds);
        next.delete(trackId);
        qc.setQueryData<Set<string>>(idsKey, next);
      }

      // Optimistic: remove from enriched track list
      if (prevEnriched) {
        qc.setQueryData<PaginatedResult<TrackResponse>>(enrichedKey, {
          ...prevEnriched,
          items: prevEnriched.items.filter(t => t.id !== trackId),
          meta:  { ...prevEnriched.meta, totalItems: prevEnriched.meta.totalItems - 1 },
        });
      }

      return { prevIds, prevEnriched };
    },

    onError: (err, _trackId, ctx) => {
      if (ctx?.prevIds)      qc.setQueryData([...queryKeys.favorites.all(), 'ids'], ctx.prevIds);
      if (ctx?.prevEnriched) qc.setQueryData([...queryKeys.favorites.all(), 'enriched'], ctx.prevEnriched);
      error('Failed to remove from favorites');
    },

    onSettled: () => {
      qc.invalidateQueries({ queryKey: queryKeys.favorites.all() });
    },
  });
}

/** One-stop hook for a single track's favorite state + toggle action. */
export function useIsFavoriteTrack(trackId: string) {
  const { data: ids }   = useFavoriteTrackIds();
  const add             = useAddFavoriteTrack();
  const remove          = useRemoveFavoriteTrack();

  const isFavorited = ids?.has(trackId) ?? false;
  const isPending   = add.isPending || remove.isPending;

  const toggle = () => {
    if (isFavorited) remove.mutate(trackId);
    else             add.mutate(trackId);
  };

  return { isFavorited, toggle, isPending };
}

// ─── Album favorites — localStorage via Zustand persist ──────────────────────

interface LocalFavState {
  albumIds:  Set<string>;
  artistIds: Set<string>;
  addAlbum:     (id: string) => void;
  removeAlbum:  (id: string) => void;
  addArtist:    (id: string) => void;
  removeArtist: (id: string) => void;
}

// Zustand doesn't serialize Set by default — store as arrays, hydrate to Set
const useLocalFavStore = create<LocalFavState>()(
  persist(
    (set, get) => ({
      albumIds:  new Set<string>(),
      artistIds: new Set<string>(),
      addAlbum:     (id) => set({ albumIds:  new Set([...get().albumIds,  id]) }),
      removeAlbum:  (id) => set(s => { const n = new Set(s.albumIds);  n.delete(id); return { albumIds:  n }; }),
      addArtist:    (id) => set({ artistIds: new Set([...get().artistIds, id]) }),
      removeArtist: (id) => set(s => { const n = new Set(s.artistIds); n.delete(id); return { artistIds: n }; }),
    }),
    {
      name: 'ms-local-favs',
      // Serialize Sets as arrays for JSON storage
      storage: {
        getItem: (key) => {
          const raw = localStorage.getItem(key);
          if (!raw) return null;
          const parsed = JSON.parse(raw);
          return {
            ...parsed,
            state: {
              ...parsed.state,
              albumIds:  new Set<string>(parsed.state?.albumIds  ?? []),
              artistIds: new Set<string>(parsed.state?.artistIds ?? []),
            },
          };
        },
        setItem: (key, value) => {
          const toStore = {
            ...value,
            state: {
              ...value.state,
              albumIds:  [...value.state.albumIds],
              artistIds: [...value.state.artistIds],
            },
          };
          localStorage.setItem(key, JSON.stringify(toStore));
        },
        removeItem: (key) => localStorage.removeItem(key),
      },
    },
  ),
);

export function useIsFavoriteAlbum(albumId: string) {
  const { albumIds, addAlbum, removeAlbum } = useLocalFavStore();
  const isFavorited = albumIds.has(albumId);
  const toggle      = () => isFavorited ? removeAlbum(albumId) : addAlbum(albumId);
  return { isFavorited, toggle, isPending: false };
}

export function useIsFavoriteArtist(artistId: string) {
  const { artistIds, addArtist, removeArtist } = useLocalFavStore();
  const isFavorited = artistIds.has(artistId);
  const toggle      = () => isFavorited ? removeArtist(artistId) : addArtist(artistId);
  return { isFavorited, toggle, isPending: false };
}

export function useFavoriteAlbumIds():  Set<string>  { return useLocalFavStore(s => s.albumIds);  }
export function useFavoriteArtistIds(): Set<string>  { return useLocalFavStore(s => s.artistIds); }
