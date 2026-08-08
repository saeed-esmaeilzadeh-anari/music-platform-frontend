"use client";
import { useState, useCallback } from "react";
import { uploadService } from "@/services/upload.service";
import type { UploadAssetType, UploadResponse } from "@/types";

export type UploadPhase =
  | "idle"
  | "presigning"
  | "uploading"
  | "confirming"
  | "processing"
  | "done"
  | "error";
export interface UploadState {
  phase: UploadPhase;
  progress: number;
  uploadId?: string;
  result?: UploadResponse;
  error?: string;
}

export function useFileUpload({
  assetType,
  trackId,
  onDone,
}: {
  assetType: UploadAssetType;
  trackId?: string;
  onDone?: (r: UploadResponse) => void;
}) {
  const [state, setState] = useState<UploadState>({
    phase: "idle",
    progress: 0,
  });

  const upload = useCallback(
    async (file: File): Promise<UploadResponse | null> => {
      try {
        setState({ phase: "presigning", progress: 0 });
        const p = await uploadService.requestPresignedUrl({
          assetType,
          originalName: file.name,
          mimeType: file.type,
          trackId,
        });
        setState({ phase: "uploading", progress: 0 });
        await uploadService.uploadToS3(p.uploadUrl, file, (pct) =>
          setState({ phase: "uploading", progress: pct })
        );
        setState({ phase: "confirming", progress: 100 });
        const result = await uploadService.confirmUpload({
          uploadId: p.uploadId,
          sizeBytes: file.size,
        });
        if (result.status === "PROCESSING")
          setState({
            phase: "processing",
            progress: 100,
            uploadId: result.id,
            result,
          });
        else setState({ phase: "done", progress: 100, result });
        onDone?.(result);
        return result;
      } catch (err) {
        setState({
          phase: "error",
          progress: 0,
          error: err instanceof Error ? err.message : "Upload failed.",
        });
        return null;
      }
    },
    [assetType, trackId, onDone]
  );

  const reset = useCallback(() => setState({ phase: "idle", progress: 0 }), []);
  return { state, upload, reset };
}
