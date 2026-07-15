import type { Metadata } from 'next';
import { ArtistClient } from './artist-client';

export const metadata: Metadata = { title: 'Artist' };

export default function ArtistPage({ params }: { params: { id: string } }) {
  return <ArtistClient id={params.id} />;
}