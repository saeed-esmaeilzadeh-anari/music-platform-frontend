'use client';

import { Heart } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  useIsFavoriteTrack,
  useIsFavoriteAlbum,
  useIsFavoriteArtist,
} from '@/hooks/use-favorites';

type FavoriteTargetType = 'track' | 'album' | 'artist';

interface FavoriteButtonProps {
  targetType: FavoriteTargetType;
  targetId:   string;
  size?:      'sm' | 'md' | 'lg';
  className?: string;
  /** Show text label alongside the icon */
  showLabel?: boolean;
}

// ─── Target-specific hooks ────────────────────────────────────────────────────
// Avoids conditional hook calls by dispatching at render time via a
// thin wrapper that always calls all three and discards the unused ones.
// (All three hooks are always called — safe per Rules of Hooks.)

function useAnyFavorite(type: FavoriteTargetType, id: string) {
  const track  = useIsFavoriteTrack(type  === 'track'  ? id : '');
  const album  = useIsFavoriteAlbum(type  === 'album'  ? id : '');
  const artist = useIsFavoriteArtist(type === 'artist' ? id : '');

  if (type === 'track')  return track;
  if (type === 'album')  return album;
  return artist;
}

const SIZE_ICON = { sm: 'h-3.5 w-3.5', md: 'h-4 w-4', lg: 'h-5 w-5' } as const;
const SIZE_BTN  = { sm: 'h-7 w-7',     md: 'h-9 w-9', lg: 'h-10 w-10' } as const;

export function FavoriteButton({
  targetType, targetId, size = 'md', className, showLabel = false,
}: FavoriteButtonProps) {
  const { isFavorited, toggle, isPending } = useAnyFavorite(targetType, targetId);

  return (
    <button
      type="button"
      onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggle(); }}
      disabled={isPending}
      aria-label={isFavorited ? 'Remove from favorites' : 'Add to favorites'}
      aria-pressed={isFavorited}
      className={cn(
        'inline-flex items-center justify-center gap-1.5',
        'rounded-full transition-all duration-150',
        'disabled:pointer-events-none',
        !showLabel && SIZE_BTN[size],
        isFavorited
          ? 'text-primary'
          : 'text-muted-foreground hover:text-primary',
        isPending && 'opacity-60',
        className,
      )}
    >
      <Heart
        className={cn(
          SIZE_ICON[size],
          'transition-all duration-150',
          isFavorited
            ? 'fill-current scale-110'
            : 'hover:scale-110',
        )}
        aria-hidden
      />
      {showLabel && (
        <span className="text-sm font-medium">
          {isFavorited ? 'Favorited' : 'Favorite'}
        </span>
      )}
    </button>
  );
}
