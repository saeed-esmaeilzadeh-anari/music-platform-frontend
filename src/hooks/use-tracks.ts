'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { tracksService } from '@/services/tracks.service';
import { queryKeys } from '@/lib/constants/query-keys';
import { STALE_TIME } from '@/lib/constants';
import { useToast } from '@/providers/toast-provider';
import { extractApiError } from '@/lib/utils/index';
import type { CreateTrackDto, TrackQuery, UpdateTrackDto } from '@/types';

// ─── Queries ──────────────────────────────────────────────────────────────────

export function useTracks(query?: TrackQuery) {
  return useQuery({
    queryKey: queryKeys.tracks.all(query),
    queryFn: () => tracksService.findAll(query),
    staleTime: STALE_TIME.STANDARD,
  });
}

export function useTrack(id: string) {
  return useQuery({
    queryKey: queryKeys.tracks.detail(id),
    queryFn: () => tracksService.findById(id),
    staleTime: STALE_TIME.STANDARD,
    enabled: !!id,
  });
}

// ─── Mutations ────────────────────────────────────────────────────────────────

export function useCreateTrack(artistId: string) {
  const qc = useQueryClient();
  const { success, error } = useToast();

  return useMutation({
    mutationFn: (dto: CreateTrackDto) => tracksService.create(artistId, dto),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['tracks'] });
      success('Track created', 'Upload the audio file next.');
    },
    onError: (err) => error('Failed to create track', extractApiError(err)),
  });
}

export function useUpdateTrack(artistId: string) {
  const qc = useQueryClient();
  const { success, error } = useToast();

  return useMutation({
    mutationFn: ({ trackId, dto }: { trackId: string; dto: UpdateTrackDto }) =>
      tracksService.update(artistId, trackId, dto),
    onSuccess: (track) => {
      qc.invalidateQueries({ queryKey: queryKeys.tracks.detail(track.id) });
      qc.invalidateQueries({ queryKey: ['tracks'] });
      success('Track updated');
    },
    onError: (err) => error('Failed to update track', extractApiError(err)),
  });
}

export function useDeleteTrack(artistId: string) {
  const qc = useQueryClient();
  const { success, error } = useToast();

  return useMutation({
    mutationFn: (trackId: string) => tracksService.delete(artistId, trackId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['tracks'] });
      success('Track deleted');
    },
    onError: (err) => error('Failed to delete track', extractApiError(err)),
  });
}

export function useRegisterPlay() {
  return useMutation({
    mutationFn: ({ id, progressSec }: { id: string; progressSec?: number }) =>
      tracksService.registerPlay(id, { progressSec }),
    // Silently fire-and-forget — no toast needed for play tracking
  });
}