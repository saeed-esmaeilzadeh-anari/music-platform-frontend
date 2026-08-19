'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter }    from 'next/navigation';
import { usersService } from '@/services/users.service';
import { authService }  from '@/services/auth.service';
import { useAuthStore } from '@/stores/auth.store';
import { queryKeys }    from '@/lib/constants/query-keys';
import { STALE_TIME }   from '@/lib/constants';
import { useToast }     from '@/providers/toast-provider';
import { extractApiError } from '@/lib/utils';
import type { UpdateUserDto } from '@/types';

// ─── Fetch current user ───────────────────────────────────────────────────────

export function useMe() {
  return useQuery({
    queryKey: queryKeys.users.me(),
    queryFn:  () => usersService.getMe(),
    staleTime: STALE_TIME.STANDARD,
  });
}

// ─── Update profile (PATCH /users/me) ────────────────────────────────────────

export function useUpdateMe() {
  const qc               = useQueryClient();
  const { setUser }      = useAuthStore();
  const { success, error } = useToast();

  return useMutation({
    mutationFn: (dto: UpdateUserDto) => usersService.updateMe(dto),

    onMutate: async (dto) => {
      await qc.cancelQueries({ queryKey: queryKeys.users.me() });
      const previous = qc.getQueryData(queryKeys.users.me());
      // Optimistic patch
      qc.setQueryData(queryKeys.users.me(), (old: any) =>
        old ? { ...old, ...dto } : old,
      );
      return { previous };
    },

    onError: (err, _dto, ctx) => {
      if (ctx?.previous) qc.setQueryData(queryKeys.users.me(), ctx.previous);
      error('Update failed', extractApiError(err));
    },

    onSuccess: (updated) => {
      // Sync auth store so TopBar avatar / username reflects change immediately
      const { data:user } = useMe()// useAuthStore.getState();
      // const { data: user, isLoading } = useMe();
      if (user) {
        setUser({
          ...user,
          firstName: updated.firstName ?? user.firstName,
          lastName:  updated.lastName  ?? user.lastName,
          avatarUrl: updated.avatarUrl ?? user.avatarUrl,
        } as any);
      }
      qc.invalidateQueries({ queryKey: queryKeys.users.me() });
      success('Profile updated');
    },
  });
}

// ─── Logout all sessions (POST /auth/logout-all) ─────────────────────────────

export function useLogoutAll() {
  const router    = useRouter();
  const { logout } = useAuthStore();
  const { success, error } = useToast();

  return useMutation({
    mutationFn: () => authService.logoutAll(),
    onSuccess: () => {
      logout();
      success('Signed out from all devices');
      router.replace('/login');
    },
    onError: (err) => error('Failed', extractApiError(err)),
  });
}

// ─── Delete account (DELETE /users/me) ───────────────────────────────────────

export function useDeleteAccount() {
  const router    = useRouter();
  const { logout } = useAuthStore();
  const { error } = useToast();

  return useMutation({
    mutationFn: () => usersService.deleteMe(),
    onSuccess: () => {
      logout();
      router.replace('/');
    },
    onError: (err) => error('Deletion failed', extractApiError(err)),
  });
}
