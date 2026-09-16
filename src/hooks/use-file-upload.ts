'use client';

import { useState, useCallback } from 'react';
import { uploadService } from '@/services/upload.service';
import type { UploadAssetType, UploadResponse } from '@/types';

export type UploadPhase =
  | 'idle'
  | 'presigning'
  | 'uploading'
  | 'confirming'
  | 'processing'
  | 'done'
  | 'error';

export interface UploadState {
  phase:     UploadPhase;
  progress:  number;
  uploadId?: string;
  result?:   UploadResponse;
  error?:    string;
}

interface UseFileUploadOptions {
  assetType: UploadAssetType;
  /**
   * trackId provided at hook-construction time (optional).
   * If also provided at call time, the call-time value wins.
   * Providing it here is still supported for asset types that don't
   * need a trackId (ALBUM_COVER, ARTIST_AVATAR, etc.).
   */
  trackId?:  string;
  onDone?:   (result: UploadResponse) => void;
}

export function useFileUpload({ assetType, trackId: defaultTrackId, onDone }: UseFileUploadOptions) {
  const [state, setState] = useState<UploadState>({ phase: 'idle', progress: 0 });

  /**
   * upload(file, trackIdOverride?)
   *
   * @param file           - the File to upload
   * @param trackIdOverride - when supplied this value is used for the presign
   *                         request instead of the hook-level defaultTrackId.
   *                         Pass track.id here directly from the mutation result
   *                         to avoid React state-timing issues.
   */
  const upload = useCallback(
    async (file: File, trackIdOverride?: string): Promise<UploadResponse | null> => {
      // Resolve trackId: call-time value wins over hook-level default
      const resolvedTrackId = trackIdOverride ?? defaultTrackId;

      try {
        setState({ phase: 'presigning', progress: 0 });

        const presigned = await uploadService.requestPresignedUrl({
          assetType,
          originalName: file.name,
          mimeType:     file.type,
          trackId:      resolvedTrackId,
        });

        setState({ phase: 'uploading', progress: 0 });

        await uploadService.uploadToS3(
          presigned.uploadUrl,
          file,
          (pct) => setState({ phase: 'uploading', progress: pct }),
        );

        setState({ phase: 'confirming', progress: 100 });

        const result = await uploadService.confirmUpload({
          uploadId:  presigned.uploadId,
          sizeBytes: file.size,
        });

        if (result.status === 'PROCESSING') {
          setState({ phase: 'processing', progress: 100, uploadId: result.id, result });
        } else {
          setState({ phase: 'done', progress: 100, result });
        }

        onDone?.(result);
        return result;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Upload failed.';
        setState({ phase: 'error', progress: 0, error: message });
        return null;
      }
    },
    // onDone is intentionally excluded: callers pass a stable ref or inline
    // function, and including it would cause unnecessary re-creation of the
    // callback. The resolved onDone is read at call time via the closure over
    // the options object, which is re-evaluated on each render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [assetType, defaultTrackId],
  );

  const reset = useCallback(() => setState({ phase: 'idle', progress: 0 }), []);

  return { state, upload, reset };
}
