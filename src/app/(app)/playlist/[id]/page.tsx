import type { Metadata } from 'next';
import { PlaylistClient } from './playlist-client';

export const metadata: Metadata = { title: 'Playlist' };

export default function PlaylistPage({ params }: { params: { id: string } }) {
  return <PlaylistClient id={params.id} />;
}
