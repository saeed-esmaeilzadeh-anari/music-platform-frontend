'use client';

/**
 * use-account.ts
 *
 * Account-level mutations that are not already covered by use-user-data.ts
 * or use-auth.ts.
 *
 * Exports:
 *   useDeleteAccount — DELETE /users/me
 *
 * For useMe, useUpdateMe  → import from '@/hooks/use-user-data'
 * For useLogoutAll        → import from '@/hooks/use-auth'
 */

import { useMutation } from '@tanstack/react-query';
import { useRouter }    from 'next/navigation';
import { usersService } from '@/services/users.service';
import { useAuthStore } from '@/stores/auth.store';
import { useToast }     from '@/providers/toast-provider';
import { extractApiError } from '@/lib/utils';

// ─── Delete account (DELETE /users/me) ───────────────────────────────────────

export function useDeleteAccount() {
  const router     = useRouter();
  const { logout } = useAuthStore();
  const { error }  = useToast();

  return useMutation({
    mutationFn: () => usersService.deleteMe(),
    onSuccess: () => {
      logout();
      router.replace('/');
    },
    onError: (err) => error('Deletion failed', extractApiError(err)),
  });
}
