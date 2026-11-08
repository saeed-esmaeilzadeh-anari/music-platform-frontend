'use client';

import { useEffect, useRef } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { preferencesService } from '@/services/preferences.service';
import { queryKeys } from '@/lib/constants/query-keys';
import { usePreferencesStore } from '@/stores/preferences.store';
import { useAuthStore } from '@/stores/auth.store';
import { useToast } from '@/providers/toast-provider';
import type {
  UpdateUserPreferencesDto,
  NotificationPreferencesWire,
  UpdateNotificationPreferencesDto,
  AccentWire,
  ThemeWire,
} from '@/types';

// ─── Server queries ──────────────────────────────────────────────────────────

export function useUserPreferences() {
  const { isAuthenticated } = useAuthStore();
  return useQuery({
    queryKey: queryKeys.preferences.user(),
    queryFn: () => preferencesService.getUserPreferences(),
    enabled: isAuthenticated,
    staleTime: 60_000,
  });
}

export function useNotificationPreferences() {
  const { isAuthenticated } = useAuthStore();
  return useQuery({
    queryKey: queryKeys.preferences.notifications(),
    queryFn: () => preferencesService.getNotificationPreferences(),
    enabled: isAuthenticated,
    staleTime: 60_000,
  });
}

// ─── Mutations (Settings UI) ─────────────────────────────────────────────────

export function useUpdateUserPreferences() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: UpdateUserPreferencesDto) =>
      preferencesService.updateUserPreferences(dto),
    onSuccess: (data) => {
      qc.setQueryData(queryKeys.preferences.user(), data);
    },
  });
}

export function useUpdateNotificationPreferences() {
  const qc = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: (dto: UpdateNotificationPreferencesDto) =>
      preferencesService.updateNotificationPreferences(dto),
    onSuccess: (data) => {
      qc.setQueryData(queryKeys.preferences.notifications(), data);
    },
    onError: () => {
      toast({
        title: 'Could not save notification settings',
        description: 'Your changes will be retried next time you edit them.',
        variant: 'error',
      });
    },
  });
}

// ─── Bidirectional sync (mounted once in ThemeProvider) ─────────────────────

const ACCENTS: AccentWire[] = ['emerald', 'violet', 'rose', 'amber', 'blue'];
const THEMES: ThemeWire[] = ['dark', 'light', 'system'];

/**
 * Hydrates the local store from the server after login and PATCHes server
 * state whenever the user changes theme/accent/motion/privacy locally.
 *
 * Loop safety: applying a server response flips `applyingRef` so the store
 * subscription ignores changes that originate from the server itself.
 * Local edits are PATCHed with a small debounce to coalesce rapid toggles.
 */
export function useServerPreferencesSync() {
  const { isAuthenticated } = useAuthStore();
  const qc = useQueryClient();
  const applyingRef = useRef(false);
  const hydratedRef = useRef(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // 1. Pull server → store once per login.
  useEffect(() => {
    if (!isAuthenticated) {
      hydratedRef.current = false;
      return;
    }
    if (hydratedRef.current) return;
    hydratedRef.current = true;

    preferencesService
      .getUserPreferences()
      .then((server) => {
        const store = usePreferencesStore.getState();
        applyingRef.current = true;
        store.setTheme(server.theme);
        store.setAccent(server.accent);
        store.setReducedMotion(server.reducedMotion);
        store.setPrivacy({
          showPlaylists: server.publicProfile,
          showListeningActivity: server.showListeningActivity,
        });
        // release on the next tick so the store subscription sees a settled state
        setTimeout(() => {
          applyingRef.current = false;
        }, 0);
      })
      .catch(() => {
        // Endpoint may be unavailable (older backend) — stay local-only.
        hydratedRef.current = false;
      });
  }, [isAuthenticated]);

  // 2. Push store → server for locally-made changes.
  useEffect(() => {
    if (!isAuthenticated) return;

    return usePreferencesStore.subscribe((s) => {
      if (applyingRef.current) return;

      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        const dto: UpdateUserPreferencesDto = {
          theme: (THEMES.includes(s.theme) ? s.theme : 'dark') as ThemeWire,
          accent: (ACCENTS.includes(s.accent) ? s.accent : 'emerald') as AccentWire,
          reducedMotion: s.reducedMotion,
          publicProfile: s.privacy.showPlaylists,
          showListeningActivity: s.privacy.showListeningActivity,
        };
        preferencesService
          .updateUserPreferences(dto)
          .then((saved) => {
            qc.setQueryData(queryKeys.preferences.user(), saved);
          })
          .catch(() => {
            // keep silent — local prefs still apply; server retried next edit
          });
      }, 800);
    });
  }, [isAuthenticated, qc]);
}

/** Convenience hook for the notifications settings section. */
export function useNotificationPreferencesSection() {
  const { data, isLoading } = useNotificationPreferences();
  const { isAuthenticated } = useAuthStore();
  const mutation = useUpdateNotificationPreferences();

  const update = (patch: Partial<NotificationPreferencesWire>) => {
    if (!isAuthenticated) return;
    mutation.mutate(patch);
  };

  return { data, isLoading, update, isSaving: mutation.isPending };
}
