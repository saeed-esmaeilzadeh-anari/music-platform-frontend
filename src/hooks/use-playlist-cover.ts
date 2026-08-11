'use client';

import { useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useFileUpload } from '@/hooks/use-file-upload';
import { queryKeys } from '@/lib/constants/query-keys';
import { useToast } from '@/providers/toast-provider';
import type { PlaylistResponse } from '@/types';

/**
 * usePlaylistCover
 *
 * Wraps useFileUpload for the PLAYLIST_COVER asset type.
 * On completion, invalidates the playlist detail query so the new
 * cover URL is reflected without a manual refresh.
 */
export function usePlaylistCover(playlistId: string) {
  const qc             = useQueryClient();
  const { success }    = useToast();

  const onDone = useCallback(() => {
    qc.invalidateQueries({ queryKey: queryKeys.playlists.detail(playlistId) });
    qc.invalidateQueries({ queryKey: queryKeys.playlists.mine() });
    success('Cover updated');
  }, [qc, playlistId, success]);

  return useFileUpload({ assetType: 'PLAYLIST_COVER' as any, onDone });
}
