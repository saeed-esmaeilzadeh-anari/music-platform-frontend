'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { artistsService } from '@/services/artists.service';
import { queryKeys } from '@/lib/constants/query-keys';
import { STALE_TIME } from '@/lib/constants';
import { useToast } from '@/providers/toast-provider';
import { extractApiError } from '@/lib/utils';
import type { CreateArtistDto, PaginationQuery, UpdateArtistDto } from '@/types';

export function useArtists(query?: PaginationQuery) {
  return useQuery({
    queryKey: queryKeys.artists.all(query),
    queryFn: () => artistsService.findAll(query),
    staleTime: STALE_TIME.STANDARD,
  });
}

export function useArtist(id: string) {
  return useQuery({
    queryKey: queryKeys.artists.detail(id),
    queryFn: () => artistsService.findById(id),
    staleTime: STALE_TIME.STANDARD,
    enabled: !!id,
  });
}

export function useCreateArtistProfile() {
  const qc = useQueryClient();
  const { success, error } = useToast();

  return useMutation({
    mutationFn: (dto: CreateArtistDto) => artistsService.create(dto),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['artists'] });
      qc.invalidateQueries({ queryKey: queryKeys.users.me() });
      success('پروفایل هنرمند ایجاد شد');
    },
    onError: (err) => error('ایجاد پروفایل ناموفق بود', extractApiError(err)),
  });
}

export function useUpdateArtist(id: string) {
  const qc = useQueryClient();
  const { success, error } = useToast();

  return useMutation({
    mutationFn: (dto: UpdateArtistDto) => artistsService.update(id, dto),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.artists.detail(id) });
      success('پروفایل ویرایش شد');
    },
    onError: (err) => error('ویرایش پروفایل ناموفق بود', extractApiError(err)),
  });
}
