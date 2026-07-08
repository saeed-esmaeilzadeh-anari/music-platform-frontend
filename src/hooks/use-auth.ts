'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { authService } from '@/services/auth.service';
import { useAuthStore } from '@/stores/auth.store';
import { useToast } from '@/providers/toast-provider';
import { extractApiError } from '@/lib/utils';
import { queryKeys } from '@/lib/constants/query-keys';
import { ROUTES } from '@/lib/constants';
import { getRefreshToken } from '@/lib/api/http-client';
import type { LoginDto, RegisterDto } from '@/types';

// ─── useLogin ─────────────────────────────────────────────────────────────────

export function useLogin() {
  const { login } = useAuthStore();
  const { success, error } = useToast();
  const router = useRouter();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (dto: LoginDto) => authService.login(dto),
    onSuccess: (data) => {
      login(data.user, data.accessToken, data.refreshToken);
      qc.invalidateQueries({ queryKey: queryKeys.users.me() });
      success('Welcome back!');
      router.push(ROUTES.BROWSE);
    },
    onError: (err) => error('Login failed', extractApiError(err)),
  });
}

// ─── useRegister ──────────────────────────────────────────────────────────────

export function useRegister() {
  const { login } = useAuthStore();
  const { success, error } = useToast();
  const router = useRouter();

  return useMutation({
    mutationFn: (dto: Omit<RegisterDto, 'confirmPassword'>) => authService.register(dto),
    onSuccess: (data) => {
      login(data.user, data.accessToken, data.refreshToken);
      success('Account created!', 'Welcome to Soundwave.');
      router.push(ROUTES.BROWSE);
    },
    onError: (err) => error('Registration failed', extractApiError(err)),
  });
}

// ─── useLogout ────────────────────────────────────────────────────────────────

export function useLogout() {
  const { logout } = useAuthStore();
  const qc = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: () => {
      // Use the named import — no require() needed
      const refreshToken = getRefreshToken();
      if (!refreshToken) return Promise.resolve();
      return authService.logout({ refreshToken });
    },
    onSettled: () => {
      logout();
      qc.clear();
      router.push(ROUTES.LOGIN);
    },
  });
}

// ─── useLogoutAll ─────────────────────────────────────────────────────────────

export function useLogoutAll() {
  const { logout } = useAuthStore();
  const { success } = useToast();
  const qc = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: () => authService.logoutAll(),
    onSuccess: () => {
      logout();
      qc.clear();
      success('Signed out everywhere');
      router.push(ROUTES.LOGIN);
    },
  });
}

// ─── Selectors ────────────────────────────────────────────────────────────────

/** Returns the in-memory user from Zustand — no network call */
export function useCurrentUser() {
  return useAuthStore((s) => s.user);
}

export function useIsAuthenticated() {
  return useAuthStore((s) => s.isAuthenticated);
}

export function useHasRole() {
  return useAuthStore((s) => s.hasRole);
}