import type { Metadata } from 'next';
import { AlbumClient } from './album-client';

export const metadata: Metadata = { title: 'Album' };

export default function AlbumPage({ params }: { params: { id: string } }) {
  return <AlbumClient id={params.id} />;
}