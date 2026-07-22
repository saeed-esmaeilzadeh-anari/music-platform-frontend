'use client';

import { useState, useCallback } from 'react';
import { uploadService } from '@/services/upload.service';
import type { UploadAssetType, UploadResponse } from '@/types';

export type UploadState =
  | { phase: 'idle' }
  | { phase: 'presigning' }
  | { phase: 'uploading'; progress: number }
  | { phase: 'confirming' }
  | { phase: 'processing'; uploadId: string }
  | { phase: 'done'; result: UploadResponse }
  | { phase: 'error'; message: string };

interface UseFileUploadOptions {
  assetType: UploadAssetType;
  trackId?: string;
  onDone?: (result: UploadResponse) => void;
}

/**
 * useFileUpload
 *
 * Orchestrates the full 3-step upload pipeline for a single file:
 *   1. POST /uploads/presign  → get S3 presigned URL
 *   2. PUT  <presignedUrl>    → upload file bytes directly to S3
 *   3. POST /uploads/confirm  → notify backend, trigger processing
 *
 * Exposes granular `UploadState` so the UI can show step-level feedback
 * (presigning, uploading with %, confirming, processing) rather than a
 * single binary loading state.
 */
export function useFileUpload({ assetType, trackId, onDone }: UseFileUploadOptions) {
  const [state, setState] = useState<UploadState>({ phase: 'idle' });

  const upload = useCallback(
    async (file: File): Promise<UploadResponse | null> => {
      try {
        // ── Step 1: request presigned URL ──────────────────────────────────
        setState({ phase: 'presigning' });
        const presigned = await uploadService.requestPresignedUrl({
          assetType,
          originalName: file.name,
          mimeType:     file.type,
          trackId,
        });

        // ── Step 2: PUT directly to S3 ──────────────────────────────────────
        setState({ phase: 'uploading', progress: 0 });
        await uploadService.uploadToS3(presigned.uploadUrl, file, (pct) => {
          setState({ phase: 'uploading', progress: pct });
        });

        // ── Step 3: confirm ─────────────────────────────────────────────────
        setState({ phase: 'confirming' });
        const result = await uploadService.confirmUpload({
          uploadId:  presigned.uploadId,
          sizeBytes: file.size,
        });

        // Audio files go into BullMQ processing; images are READY immediately
        if (result.status === 'PROCESSING') {
          setState({ phase: 'processing', uploadId: result.id });
        } else {
          setState({ phase: 'done', result });
        }

        onDone?.(result);
        return result;
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'Upload failed. Please try again.';
        setState({ phase: 'error', message });
        return null;
      }
    },
    [assetType, trackId, onDone],
  );

  const reset = useCallback(() => setState({ phase: 'idle' }), []);

  return { state, upload, reset };
}