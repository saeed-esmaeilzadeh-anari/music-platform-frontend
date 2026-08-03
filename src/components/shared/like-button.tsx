'use client';

import { useState } from 'react';
import { Heart } from 'lucide-react';
import { cn } from '@/lib/utils/index';
import { useLike, useUnlike } from '@/hooks/use-catalog';
import type { LikeTargetType } from '@/types';

interface LikeButtonProps {
  targetType: LikeTargetType;
  targetId: string;
  initialLiked?: boolean;
  size?: 'sm' | 'md';
  className?: string;
}

export function LikeButton({ targetType, targetId, initialLiked = false, size = 'md', className }: LikeButtonProps) {
  const [liked, setLiked] = useState(initialLiked);
  const likeMutation   = useLike();
  const unlikeMutation = useUnlike();

  const isPending = likeMutation.isPending || unlikeMutation.isPending;

  const toggle = () => {
    const next = !liked;
    setLiked(next); // optimistic
    if (next) {
      likeMutation.mutate({ targetType, targetId }, { onError: () => setLiked(false) });
    } else {
      unlikeMutation.mutate({ targetType, targetId }, { onError: () => setLiked(true) });
    }
  };

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={isPending}
      aria-label={liked ? 'Unlike' : 'Like'}
      aria-pressed={liked}
      className={cn(
        'transition-all duration-150 disabled:pointer-events-none',
        liked ? 'text-primary' : 'text-muted-foreground hover:text-foreground',
        className,
      )}
    >
      <Heart
        className={cn(size === 'sm' ? 'h-4 w-4' : 'h-5 w-5', liked && 'fill-current')}
        aria-hidden
      />
    </button>
  );
}