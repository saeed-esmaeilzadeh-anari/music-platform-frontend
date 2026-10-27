'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { artistsService } from '@/services/artists.service';
import { authService } from '@/services/auth.service';
import { useAuthStore } from '@/stores/auth.store';
import { getRefreshToken } from '@/lib/api/http-client';
import { queryKeys } from '@/lib/constants/query-keys';
import { STALE_TIME, ROUTES } from '@/lib/constants';
import { useToast } from '@/providers/toast-provider';
import { useLocale } from '@/providers/locale-provider';
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
  const router = useRouter();
  const login = useAuthStore((state) => state.login);
  const { success, error } = useToast();
  const { t } = useLocale();

  return useMutation({
    mutationFn: (dto: CreateArtistDto) => artistsService.create(dto),
    onSuccess: async (artist) => {
      qc.setQueryData(queryKeys.artists.mine(), artist);
      await Promise.all([
        qc.invalidateQueries({ queryKey: ['artists'] }),
        qc.invalidateQueries({ queryKey: queryKeys.users.me() }),
      ]);

      // The API promotes LISTENER to ARTIST when it creates the profile.
      // Refresh tokens so the role claim in the access token matches the database.
      const refreshToken = getRefreshToken();
      if (!refreshToken) {
        error(t('artistProfile.sessionRefreshTitle'), t('artistProfile.sessionRefreshDescription'));
        return;
      }

      try {
        const refreshed = await authService.refresh({ refreshToken });
        login(refreshed.user, refreshed.accessToken, refreshed.refreshToken);
        await qc.invalidateQueries({ queryKey: queryKeys.users.me() });
        success(t('artistProfile.createdToast'));
        router.push(ROUTES.UPLOAD);
      } catch {
        error(t('artistProfile.sessionRefreshTitle'), t('artistProfile.sessionRefreshDescription'));
      }
    },
    onError: (err) => error(t('artistProfile.createFailed'), extractApiError(err)),
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
