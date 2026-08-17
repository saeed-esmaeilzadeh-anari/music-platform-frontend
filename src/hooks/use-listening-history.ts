'use client';

import { useInfiniteQuery, useQuery, useQueryClient } from '@tanstack/react-query';
import { listeningHistoryService } from '@/services/listening-history.service';
import { tracksService }           from '@/services/tracks.service';
import { queryKeys }                from '@/lib/constants/query-keys';
import { STALE_TIME }               from '@/lib/constants';
import type { ListeningHistoryResponse, TrackResponse, PaginatedResult } from '@/types';

const LIMIT = 20;

// ─── Shared types ─────────────────────────────────────────────────────────────

export interface EnrichedHistory extends ListeningHistoryResponse {
  track: TrackResponse | null;
}

export interface MostPlayedEntry {
  trackId:    string;
  track:      TrackResponse | null;
  playCount:  number;
  lastPlayed: string;
}

// ─── Shared enrichment helper (uses qc for per-track caching) ────────────────

async function enrichRecords(
  records: ListeningHistoryResponse[],
  fetchTrack: (id: string) => Promise<TrackResponse | null>,
): Promise<EnrichedHistory[]> {
  const tracks = await Promise.all(records.map(h => fetchTrack(h.trackId)));
  return records.map((h, i) => ({ ...h, track: tracks[i] }));
}

// ─── Raw infinite history ─────────────────────────────────────────────────────

export function useHistoryInfinite() {
  return useInfiniteQuery({
    queryKey:         queryKeys.history.all(),
    queryFn:          ({ pageParam }) =>
      listeningHistoryService.findOwn({ page: pageParam as number, limit: LIMIT }),
    initialPageParam: 1,
    getNextPageParam: (last: PaginatedResult<ListeningHistoryResponse>) =>
      last.meta.hasNextPage ? last.meta.page + 1 : undefined,
    staleTime: STALE_TIME.SHORT,
  });
}

// ─── Recently played — deduplicated, most recent 20 ──────────────────────────

export function useRecentlyPlayed() {
  const qc = useQueryClient();

  const fetchTrack = (id: string) =>
    qc.fetchQuery({
      queryKey:  queryKeys.tracks.detail(id),
      queryFn:   () => tracksService.findById(id),
      staleTime: STALE_TIME.STANDARD,
    }).catch(() => null);

  return useQuery({
    queryKey: [...queryKeys.history.all(), 'recent'] as const,
    queryFn:  async () => {
      const { items } = await listeningHistoryService.findOwn({ limit: 60, page: 1 });
      const seen = new Set<string>();
      const unique = items.filter(h => {
        if (seen.has(h.trackId)) return false;
        seen.add(h.trackId);
        return true;
      }).slice(0, 20);
      return enrichRecords(unique, fetchTrack);
    },
    staleTime: STALE_TIME.SHORT,
  });
}

// ─── Continue listening — incomplete plays between 5–95% ─────────────────────

export function useContinueListening() {
  const qc = useQueryClient();

  const fetchTrack = (id: string) =>
    qc.fetchQuery({
      queryKey:  queryKeys.tracks.detail(id),
      queryFn:   () => tracksService.findById(id),
      staleTime: STALE_TIME.STANDARD,
    }).catch(() => null);

  return useQuery({
    queryKey: [...queryKeys.history.all(), 'continue'] as const,
    queryFn:  async () => {
      const { items } = await listeningHistoryService.findOwn({ limit: 100, page: 1 });

      // Most recent non-completed play per track
      const seen       = new Set<string>();
      const incomplete = items
        .filter(h => {
          if (h.completed || seen.has(h.trackId)) return false;
          seen.add(h.trackId);
          return true;
        })
        .slice(0, 12);

      const enriched = await enrichRecords(incomplete, fetchTrack);

      // Filter to tracks where 5% ≤ progress ≤ 95%
      return enriched.filter(e => {
        if (!e.track) return false;
        const pct = e.track.durationSec > 0
          ? e.progressSec / e.track.durationSec
          : 0;
        return pct >= 0.05 && pct < 0.95;
      });
    },
    staleTime: STALE_TIME.SHORT,
  });
}

// ─── Most played — client-side aggregation of play counts ────────────────────

export function useMostPlayed(topN = 10) {
  const qc = useQueryClient();

  const fetchTrack = (id: string) =>
    qc.fetchQuery({
      queryKey:  queryKeys.tracks.detail(id),
      queryFn:   () => tracksService.findById(id),
      staleTime: STALE_TIME.STANDARD,
    }).catch(() => null);

  return useQuery({
    queryKey: [...queryKeys.history.all(), 'mostPlayed', topN] as const,
    queryFn:  async (): Promise<MostPlayedEntry[]> => {
      // Fetch a large batch to compute counts; backend has no aggregate endpoint
      const { items } = await listeningHistoryService.findOwn({ limit: 500, page: 1 });

      // Aggregate per trackId
      const map = new Map<string, { count: number; lastPlayed: string }>();
      for (const h of items) {
        const cur = map.get(h.trackId);
        if (!cur) {
          map.set(h.trackId, { count: 1, lastPlayed: h.playedAt });
        } else {
          cur.count++;
          if (h.playedAt > cur.lastPlayed) cur.lastPlayed = h.playedAt;
        }
      }

      const sorted = [...map.entries()]
        .sort((a, b) => b[1].count - a[1].count)
        .slice(0, topN);

      const tracks = await Promise.all(sorted.map(([id]) => fetchTrack(id)));

      return sorted.map(([trackId, { count, lastPlayed }], i) => ({
        trackId,
        track:      tracks[i],
        playCount:  count,
        lastPlayed,
      }));
    },
    staleTime: STALE_TIME.SHORT,
  });
}

// ─── Full enriched history (first page, for stats display) ───────────────────

export function useEnrichedHistory(limit = 50) {
  const qc = useQueryClient();

  const fetchTrack = (id: string) =>
    qc.fetchQuery({
      queryKey:  queryKeys.tracks.detail(id),
      queryFn:   () => tracksService.findById(id),
      staleTime: STALE_TIME.STANDARD,
    }).catch(() => null);

  return useQuery({
    queryKey: [...queryKeys.history.all(), 'enriched', limit] as const,
    queryFn:  async () => {
      const { items } = await listeningHistoryService.findOwn({ limit, page: 1 });
      return enrichRecords(items, fetchTrack);
    },
    staleTime: STALE_TIME.SHORT,
  });
}
