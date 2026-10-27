import type { Metadata } from 'next';
import { AlbumClient } from './album-client';

export const metadata: Metadata = { title: 'Album' };

export default async function AlbumPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <AlbumClient id={id} />;
}
