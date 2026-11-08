'use client';

import { UserPlus, UserCheck, Loader2 } from 'lucide-react';
import { useIsFollowing, useFollowArtist } from '@/hooks/use-social';
import { useAuthStore } from '@/stores/auth.store';
import { useLocale } from '@/providers/locale-provider';
import { cn } from '@/lib/utils';

interface FollowArtistButtonProps {
  artistId: string;
  /** Do not render for the artist's own profile. */
  isSelf?: boolean;
  size?: 'sm' | 'md';
  className?: string;
}

/**
 * Follow / unfollow toggle for artist profiles. Optimistic-feeling UX:
 * the shared mutation updates the cached follow state immediately and
 * surfaces a toast. Hidden for anonymous users? No — shown, and the
 * mutation redirects attention with a "sign in" toast on 401.
 */
export function FollowArtistButton({
  artistId,
  isSelf = false,
  size = 'md',
  className,
}: FollowArtistButtonProps) {
  const { t } = useLocale();
  const { isAuthenticated } = useAuthStore();
  const { data: isFollowing, isLoading } = useIsFollowing(
    isAuthenticated && !isSelf ? artistId : undefined,
  );
  const followMutation = useFollowArtist();

  if (isSelf) return null;

  const following = isFollowing ?? false;
  const pending = followMutation.isPending || (isLoading && isFollowing === undefined);

  const handleClick = () => {
    followMutation.mutate({ artistId, follow: !following });
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={pending}
      aria-pressed={following}
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border font-medium transition-colors',
        'disabled:opacity-60 disabled:cursor-wait',
        size === 'sm' ? 'px-3 py-1.5 text-xs' : 'px-4 py-2 text-sm',
        following
          ? 'border-border bg-secondary text-foreground hover:bg-secondary/70'
          : 'border-primary/40 bg-primary/10 text-primary hover:bg-primary/20',
        className,
      )}
    >
      {pending ? (
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
      ) : following ? (
        <UserCheck className="h-3.5 w-3.5" />
      ) : (
        <UserPlus className="h-3.5 w-3.5" />
      )}
      {following ? t('follow.following') : t('follow.follow')}
    </button>
  );
}
