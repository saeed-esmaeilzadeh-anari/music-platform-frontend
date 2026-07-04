/**
 * Upload Service
 * Flow: POST /uploads/presign → PUT directly to S3 → POST /uploads/confirm
 * Endpoints:
 *  POST /uploads/presign    (authenticated)
 *  POST /uploads/confirm    (authenticated)
 *  GET  /uploads/:id        (authenticated, own uploads only)
 */

import axios from "axios";
import { apiGet, apiPost } from "@/lib/api/http-client";
import type {
  RequestUploadDto,
  PresignedUploadResponse,
  ConfirmUploadDto,
  UploadResponse,
} from "@/types";

export const uploadService = {
  /** Step 1: request a presigned S3 URL */
  requestPresignedUrl: (dto: RequestUploadDto): Promise<PresignedUploadResponse> =>
    apiPost<PresignedUploadResponse>("/uploads/presign", dto),

  /**
   * Step 2: PUT the raw file directly to S3 using the presigned URL.
   * This call bypasses our Axios instance since it goes to AWS, not our API.
   */
  uploadToS3: async (presignedUrl: string,file: File,onProgress?: (percent: number) => void): Promise<void> => {
    await axios.put(presignedUrl, file, {
      headers: { "Content-Type": file.type },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const percent = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          onProgress(percent);
        }
      },
    });
  },

  /** Step 3: confirm the upload and trigger processing */
  confirmUpload: (dto: ConfirmUploadDto): Promise<UploadResponse> =>
    apiPost<UploadResponse>("/uploads/confirm", dto),

  /** Poll upload status */
  getUploadStatus: (id: string): Promise<UploadResponse> =>
    apiGet<UploadResponse>(`/uploads/${id}`),

  /**
   * Full orchestrated upload: presign → S3 PUT → confirm
   */
  uploadFile: async (
    dto: RequestUploadDto,
    file: File,
    onProgress?: (percent: number) => void
  ): Promise<UploadResponse> => {
    const presigned = await uploadService.requestPresignedUrl(dto);
    await uploadService.uploadToS3(presigned.uploadUrl, file, onProgress);
    return uploadService.confirmUpload({
      uploadId: presigned.uploadId,
      sizeBytes: file.size,
    });
  },
};
