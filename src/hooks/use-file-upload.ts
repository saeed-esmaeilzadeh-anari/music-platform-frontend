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
  phase: UploadPhase;
  progress: number;   // 0-100, only meaningful during 'uploading'
  uploadId?: string;  // set after confirm, used for polling
  result?: UploadResponse;
  error?: string;
}

interface UseFileUploadOptions {
  assetType: UploadAssetType;
  trackId?: string;
  onDone?: (result: UploadResponse) => void;
}

export function useFileUpload({ assetType, trackId, onDone }: UseFileUploadOptions) {
  const [state, setState] = useState<UploadState>({ phase: 'idle', progress: 0 });

  const upload = useCallback(async (file: File): Promise<UploadResponse | null> => {
    try {
      // Step 1 — presign
      setState({ phase: 'presigning', progress: 0 });
      const presigned = await uploadService.requestPresignedUrl({
        assetType,
        originalName: file.name,
        mimeType:     file.type,
        trackId,
      });

      // Step 2 — PUT to S3
      setState({ phase: 'uploading', progress: 0 });
      await uploadService.uploadToS3(presigned.uploadUrl, file, (pct) => {
        setState({ phase: 'uploading', progress: pct });
      });

      // Step 3 — confirm
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
      const error = err instanceof Error ? err.message : 'Upload failed. Please try again.';
      setState({ phase: 'error', progress: 0, error });
      return null;
    }
  }, [assetType, trackId, onDone]);

  const reset = useCallback(() => setState({ phase: 'idle', progress: 0 }), []);

  return { state, upload, reset };
}
