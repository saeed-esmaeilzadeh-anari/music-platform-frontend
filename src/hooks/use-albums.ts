'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { albumsService } from '@/services/albums.service';
import { queryKeys } from '@/lib/constants/query-keys';
import { STALE_TIME } from '@/lib/constants';
import { useToast } from '@/providers/toast-provider';
import { extractApiError } from '@/lib/utils';
import type { AlbumQuery, CreateAlbumDto, UpdateAlbumDto } from '@/types';

export function useAlbums(query?: AlbumQuery) {
  return useQuery({
    queryKey: queryKeys.albums.all(query),
    queryFn: () => albumsService.findAll(query),
    staleTime: STALE_TIME.STANDARD,
  });
}

export function useAlbum(id: string) {
  return useQuery({
    queryKey: queryKeys.albums.detail(id),
    queryFn: () => albumsService.findById(id),
    staleTime: STALE_TIME.STANDARD,
    enabled: !!id,
  });
}

export function useArtistAlbums(artistId: string, query?: AlbumQuery) {
  return useQuery({
    queryKey: queryKeys.albums.byArtist(artistId, query),
    queryFn: () => albumsService.findAll({ ...query, artistId }),
    staleTime: STALE_TIME.STANDARD,
    enabled: !!artistId,
  });
}

export function useCreateAlbum(artistId: string) {
  const qc = useQueryClient();
  const { success, error } = useToast();

  return useMutation({
    mutationFn: (dto: CreateAlbumDto) => albumsService.create(artistId, dto),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['albums'] });
      success('Album created');
    },
    onError: (err) => error('Failed to create album', extractApiError(err)),
  });
}

export function useUpdateAlbum(id: string) {
  const qc = useQueryClient();
  const { success, error } = useToast();

  return useMutation({
    mutationFn: (dto: UpdateAlbumDto) => albumsService.update(id, dto),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.albums.detail(id) });
      qc.invalidateQueries({ queryKey: ['albums'] });
      success('Album updated');
    },
    onError: (err) => error('Failed to update album', extractApiError(err)),
  });
}

export function useDeleteAlbum() {
  const qc = useQueryClient();
  const { success, error } = useToast();

  return useMutation({
    mutationFn: (id: string) => albumsService.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['albums'] });
      success('Album deleted');
    },
    onError: (err) => error('Failed to delete album', extractApiError(err)),
  });
}