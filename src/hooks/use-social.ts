'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { artistsService } from '@/services/artists.service';
import { reportsService } from '@/services/reports.service';
import { queryKeys } from '@/lib/constants/query-keys';
import { useAuthStore } from '@/stores/auth.store';
import { useToast } from '@/providers/toast-provider';
import type { CreateReportDto, FollowState } from '@/types';

// ─── Follow state ────────────────────────────────────────────────────────────

export function useIsFollowing(artistId: string | undefined) {
  const { isAuthenticated } = useAuthStore();
  return useQuery({
    queryKey: queryKeys.follows.isFollowing(artistId ?? ''),
    queryFn: () =>
      artistsService.isFollowing(artistId as string).then((r) => r.following),
    enabled: isAuthenticated && Boolean(artistId),
    staleTime: 30_000,
  });
}

export function useFollowArtist() {
  const qc = useQueryClient();
  const { toast } = useToast();
  const { isAuthenticated } = useAuthStore();

  return useMutation({
    mutationFn: ({ artistId, follow }: { artistId: string; follow: boolean }) =>
      follow ? artistsService.follow(artistId) : artistsService.unfollow(artistId),
    onSuccess: (result: FollowState, variables) => {
      qc.setQueryData(queryKeys.follows.isFollowing(variables.artistId), result.following);
      toast({
        title: result.following ? 'Following' : 'Unfollowed',
        description: result.following
          ? 'New releases from this artist will appear in your feed.'
          : 'You will no longer see updates from this artist.',
        variant: 'success',
      });
    },
    onError: () => {
      if (!isAuthenticated) {
        toast({ title: 'Sign in to follow artists', variant: 'error' });
        return;
      }
      toast({ title: 'Something went wrong', variant: 'error' });
    },
  });
}

// ─── Reports ─────────────────────────────────────────────────────────────────

export function useCreateReport() {
  const { toast } = useToast();
  return useMutation({
    mutationFn: (dto: CreateReportDto) => reportsService.create(dto),
    onSuccess: () => {
      toast({
        title: 'Report submitted',
        description: 'Thanks — our moderation team will review it.',
        variant: 'success',
      });
    },
    onError: () => {
      toast({ title: 'Could not submit report', variant: 'error' });
    },
  });
}
