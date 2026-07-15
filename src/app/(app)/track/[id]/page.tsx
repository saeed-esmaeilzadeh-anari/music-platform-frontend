import type { Metadata } from 'next';
import { TrackClient } from './track-client';

export const metadata: Metadata = { title: 'Track' };

export default function TrackPage({ params }: { params: { id: string } }) {
  return <TrackClient id={params.id} />;
}