'use client';

import Link from 'next/link';
import { formatCount } from '@/lib/utils';
import { CoverImage } from '@/components/shared/cover-image';
import { ROUTES } from '@/lib/constants';
import type { ArtistResponse } from '@/types';

interface ArtistCardProps {
  artist: ArtistResponse;
}

export function ArtistCard({ artist }: ArtistCardProps) {
  return (
    <Link href={ROUTES.ARTIST(artist.id)} className="group block space-y-3 text-center">
      <div className="relative aspect-square overflow-hidden rounded-full bg-secondary mx-auto">
        <CoverImage src={null} alt={artist.stageName} type="artist" size="xl" />
        <div className="absolute inset-0 rounded-full ring-2 ring-transparent group-hover:ring-primary/40 transition-all duration-200" />
      </div>
      <div className="px-1">
        <p className="truncate text-sm font-semibold group-hover:text-primary transition-colors">
          {artist.stageName}
        </p>
        <p className="truncate text-xs text-muted-foreground mt-0.5">
          {formatCount(artist.monthlyListeners)} monthly listeners
        </p>
      </div>
    </Link>
  );
}