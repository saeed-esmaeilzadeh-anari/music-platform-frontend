import type { Metadata } from 'next';
import { UploadClient } from './upload-client';

export const metadata: Metadata = { title: 'Upload' };

export default function UploadPage() {
  return <UploadClient />;
}