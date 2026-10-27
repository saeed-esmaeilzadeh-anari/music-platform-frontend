import type { Metadata } from 'next';
import { ArtistClient } from './artist-client';

export const metadata: Metadata = { title: 'Artist' };

export default async function ArtistPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <ArtistClient id={id} />;
}
