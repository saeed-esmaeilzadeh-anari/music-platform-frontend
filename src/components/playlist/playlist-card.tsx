'use client';

import Link from 'next/link';
import { Play, Lock } from 'lucide-react';
import { cn } from '@/lib/utils/index';
import { CoverImage } from '@/components/shared/cover-image';
import { ROUTES } from '@/lib/constants';
import type { PlaylistResponse } from '@/types';

interface PlaylistCardProps {
  playlist: PlaylistResponse;
}

export function PlaylistCard({ playlist }: PlaylistCardProps) {
  return (
    <Link href={ROUTES.PLAYLIST(playlist.id)} className="group block space-y-3">
      <div className="relative aspect-square overflow-hidden rounded-md bg-secondary">
        <CoverImage src={playlist.coverUrl} alt={playlist.title} type="playlist" size="xl" />
        {playlist.visibility === 'PRIVATE' && (
          <div className="absolute top-2 left-2 flex h-5 w-5 items-center justify-center rounded-full bg-black/60">
            <Lock className="h-2.5 w-2.5 text-white" aria-label="Private" />
          </div>
        )}
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
          {playlist.title}
        </p>
        {playlist.description && (
          <p className="truncate text-xs text-muted-foreground mt-0.5">{playlist.description}</p>
        )}
      </div>
    </Link>
  );
}