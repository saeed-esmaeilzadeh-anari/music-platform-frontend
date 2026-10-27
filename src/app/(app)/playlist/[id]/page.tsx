import type { Metadata } from 'next';
import { PlaylistClient } from './playlist-client';

export const metadata: Metadata = { title: 'Playlist' };

export default async function PlaylistPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <PlaylistClient id={id} />;
}
