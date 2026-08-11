'use client';

import { useEffect, useRef, useCallback } from 'react';
import {
  Bell, BellOff, Check, CheckCheck,
  UserPlus, Music2, ListMusic, MessageSquare,
  Heart, CreditCard, AlertCircle, Info,
} from 'lucide-react';
import { cn, formatRelativeTime } from '@/lib/utils';
import {
  useNotificationsInfinite,
  useMarkRead,
  useMarkAllRead,
  useUnreadCount,
} from '@/hooks/use-notifications';
import type { NotificationResponse, NotificationType } from '@/types';

// ─── Notification type config ─────────────────────────────────────────────────

const TYPE_CONFIG: Record<
  NotificationType,
  { icon: React.ElementType; color: string; bg: string }
> = {
  NEW_FOLLOWER:          { icon: UserPlus,     color: 'text-blue-400',    bg: 'bg-blue-500/15'    },
  NEW_RELEASE:           { icon: Music2,        color: 'text-primary',     bg: 'bg-primary/15'     },
  PLAYLIST_ADD:          { icon: ListMusic,     color: 'text-violet-400',  bg: 'bg-violet-500/15'  },
  COMMENT_REPLY:         { icon: MessageSquare, color: 'text-amber-400',   bg: 'bg-amber-500/15'   },
  LIKE_RECEIVED:         { icon: Heart,         color: 'text-rose-400',    bg: 'bg-rose-500/15'    },
  SUBSCRIPTION_RENEWED:  { icon: CreditCard,    color: 'text-emerald-400', bg: 'bg-emerald-500/15' },
  SUBSCRIPTION_EXPIRING: { icon: AlertCircle,   color: 'text-amber-400',   bg: 'bg-amber-500/15'   },
  PAYMENT_FAILED:        { icon: AlertCircle,   color: 'text-destructive', bg: 'bg-destructive/15' },
  SYSTEM:                { icon: Info,          color: 'text-muted-foreground', bg: 'bg-secondary' },
};

// ─── Single notification row ──────────────────────────────────────────────────

function NotificationRow({ notification }: { notification: NotificationResponse }) {
  const markRead = useMarkRead();
  const { icon: Icon, color, bg } = TYPE_CONFIG[notification.type] ?? TYPE_CONFIG.SYSTEM;

  const handleClick = () => {
    if (!notification.isRead) {
      markRead.mutate(notification.id);
    }
  };

  return (
    <div
      role="listitem"
      onClick={handleClick}
      className={cn(
        'flex items-start gap-4 px-5 py-4 cursor-pointer transition-colors',
        'border-b border-border/50 last:border-b-0',
        notification.isRead
          ? 'hover:bg-secondary/50'
          : 'bg-primary/[0.03] hover:bg-primary/[0.06]',
      )}
    >
      {/* Icon badge */}
      <div className={cn('flex h-9 w-9 shrink-0 items-center justify-center rounded-full mt-0.5', bg)}>
        <Icon className={cn('h-4 w-4', color)} aria-hidden />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p className={cn(
            'text-sm leading-snug',
            notification.isRead ? 'text-foreground font-normal' : 'text-foreground font-semibold',
          )}>
            {notification.title}
          </p>
          <span className="text-[11px] text-muted-foreground shrink-0 mt-0.5">
            {formatRelativeTime(notification.createdAt)}
          </span>
        </div>
        <p className="mt-0.5 text-sm text-muted-foreground leading-snug line-clamp-2">
          {notification.body}
        </p>
      </div>

      {/* Unread dot */}
      <div className="mt-1.5 shrink-0">
        {!notification.isRead ? (
          <span className="h-2 w-2 rounded-full bg-primary block" aria-label="Unread" />
        ) : (
          <span className="h-2 w-2 block" aria-hidden /> /* spacer */
        )}
      </div>
    </div>
  );
}

// ─── Loading skeleton ─────────────────────────────────────────────────────────

function NotificationSkeleton() {
  return (
    <div className="flex items-start gap-4 px-5 py-4 border-b border-border/50">
      <div className="h-9 w-9 shrink-0 rounded-full bg-secondary animate-pulse" />
      <div className="flex-1 space-y-2 pt-0.5">
        <div className="flex items-center justify-between gap-4">
          <div className="h-3.5 w-40 rounded bg-secondary animate-pulse" />
          <div className="h-3 w-12 rounded bg-secondary animate-pulse" />
        </div>
        <div className="h-3 w-3/4 rounded bg-secondary animate-pulse" />
      </div>
      <div className="h-2 w-2 rounded-full bg-secondary animate-pulse mt-1.5 shrink-0" />
    </div>
  );
}

// ─── Tab filter ────────────────────────────────────────────────────────────────

type FilterTab = 'all' | 'unread';

function TabBar({
  active,
  unreadCount,
  onChange,
}: {
  active: FilterTab;
  unreadCount: number;
  onChange: (tab: FilterTab) => void;
}) {
  return (
    <div className="flex border-b border-border">
      {(['all', 'unread'] as FilterTab[]).map((tab) => (
        <button
          key={tab}
          type="button"
          onClick={() => onChange(tab)}
          className={cn(
            'flex items-center gap-2 px-5 py-3 text-sm font-medium border-b-2 -mb-px transition-colors',
            active === tab
              ? 'border-primary text-foreground'
              : 'border-transparent text-muted-foreground hover:text-foreground',
          )}
        >
          {tab === 'all' ? 'All' : 'Unread'}
          {tab === 'unread' && unreadCount > 0 && (
            <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-primary px-1.5 text-[10px] font-bold text-primary-foreground">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </button>
      ))}
    </div>
  );
}

// ─── NotificationsClient ──────────────────────────────────────────────────────

export function NotificationsClient() {
  const { data: unreadData }  = useUnreadCount();
  const unreadCount           = unreadData?.count ?? 0;
  const markAllRead           = useMarkAllRead();

  const {
    data, isLoading, isFetchingNextPage,
    hasNextPage, fetchNextPage,
    isError,
  } = useNotificationsInfinite();

  // Flatten all pages into a single notification list
  const allNotifications = data?.pages.flatMap((p) => p.items) ?? [];

  // Client-side tab filter (no extra API call — we filter in memory)
  const [filterTab, setFilterTab] = useFilterTab();

  const displayed = filterTab === 'unread'
    ? allNotifications.filter((n) => !n.isRead)
    : allNotifications;

  // ── Infinite scroll sentinel ──────────────────────────────────────────────
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 0, rootMargin: '200px' },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 lg:px-8">

      {/* ── Page header ── */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Notifications</h1>
          {unreadCount > 0 && (
            <p className="mt-0.5 text-sm text-muted-foreground">
              {unreadCount} unread
            </p>
          )}
        </div>

        {/* Mark all read */}
        {unreadCount > 0 && (
          <button
            type="button"
            onClick={() => markAllRead.mutate()}
            disabled={markAllRead.isPending}
            className={cn(
              'flex items-center gap-2 rounded-md border border-border px-3 py-2',
              'text-sm text-muted-foreground hover:text-foreground hover:border-primary/40',
              'transition-colors disabled:opacity-50',
            )}
          >
            <CheckCheck className="h-4 w-4" aria-hidden />
            <span>{markAllRead.isPending ? 'Marking…' : 'Mark all read'}</span>
          </button>
        )}
      </div>

      {/* ── Tab filter ── */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <TabBar active={filterTab} unreadCount={unreadCount} onChange={setFilterTab} />

        {/* ── List ── */}
        <div role="list" aria-label="Notifications">

          {/* Loading state */}
          {isLoading && (
            Array.from({ length: 8 }).map((_, i) => <NotificationSkeleton key={i} />)
          )}

          {/* Error state */}
          {isError && !isLoading && (
            <div className="flex flex-col items-center gap-3 py-16 text-center">
              <AlertCircle className="h-10 w-10 text-muted-foreground/30" />
              <p className="text-sm text-muted-foreground">Failed to load notifications.</p>
            </div>
          )}

          {/* Empty state */}
          {!isLoading && !isError && displayed.length === 0 && (
            <div className="flex flex-col items-center gap-4 py-16 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-secondary border border-border">
                {filterTab === 'unread'
                  ? <BellOff className="h-7 w-7 text-muted-foreground/40" />
                  : <Bell    className="h-7 w-7 text-muted-foreground/40" />}
              </div>
              <div>
                <p className="font-semibold text-foreground">
                  {filterTab === 'unread' ? 'All caught up!' : 'No notifications yet'}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {filterTab === 'unread'
                    ? 'You have no unread notifications.'
                    : 'Activity from your followers and tracks will appear here.'}
                </p>
              </div>
              {filterTab === 'unread' && allNotifications.length > 0 && (
                <button type="button" onClick={() => setFilterTab('all')}
                  className="text-sm text-primary hover:underline">
                  View all notifications
                </button>
              )}
            </div>
          )}

          {/* Notification rows */}
          {displayed.map((n) => (
            <NotificationRow key={n.id} notification={n} />
          ))}

          {/* Load more skeleton (while fetching next page) */}
          {isFetchingNextPage && (
            Array.from({ length: 3 }).map((_, i) => <NotificationSkeleton key={`loading-${i}`} />)
          )}
        </div>

        {/* Infinite scroll sentinel */}
        <div ref={sentinelRef} className="h-4" aria-hidden />

        {/* End of list */}
        {!hasNextPage && !isLoading && displayed.length > 0 && (
          <div className="flex items-center justify-center gap-2 py-4 text-xs text-muted-foreground/60">
            <Check className="h-3 w-3" />
            All notifications loaded
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Simple useState wrapper for the tab ────────────────────────────────────

function useFilterTab(): [FilterTab, (t: FilterTab) => void] {
  const [tab, setTab] = (
    // eslint-disable-next-line react-hooks/rules-of-hooks
    require('react').useState as (v: FilterTab) => [FilterTab, (v: FilterTab) => void]
  )('all');
  return [tab, setTab];
}
