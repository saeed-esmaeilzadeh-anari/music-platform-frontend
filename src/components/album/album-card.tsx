'use client';

import Link from 'next/link';
import { Play } from 'lucide-react';
import { cn, formatDate } from '@/lib/utils/index';
import { CoverImage } from '@/components/shared/cover-image';
import { ROUTES } from '@/lib/constants';
import type { AlbumResponse } from '@/types';

interface AlbumCardProps {
  album: AlbumResponse;
  artistName?: string;
}

export function AlbumCard({ album, artistName }: AlbumCardProps) {
  return (
    <Link href={ROUTES.ALBUM(album.id)} className="group block space-y-3">
      <div className="relative aspect-square overflow-hidden rounded-md bg-secondary">
        <CoverImage src={album.coverUrl} alt={album.title} type="album" size="xl" />
        <div className={cn(
          'absolute bottom-2 right-2 flex h-10 w-10 items-center justify-center rounded-full',
          'bg-primary text-primary-foreground shadow-lg',
          'translate-y-2 opacity-0 transition-all duration-200',
          'group-hover:translate-y-0 group-hover:opacity-100',
        )}>
          <Play className="h-4 w-4 fill-current translate-x-px" />
        </div>
      </div>
      <div className="px-1">
        <p className="truncate text-sm font-semibold group-hover:text-primary transition-colors">
          {album.title}
        </p>
        <p className="truncate text-xs text-muted-foreground mt-0.5">
          {album.releaseDate ? formatDate(album.releaseDate, { year: 'numeric' }) : ''}
          {artistName && album.releaseDate ? ' · ' : ''}
          {artistName ?? ''}
        </p>
      </div>
    </Link>
  );
}