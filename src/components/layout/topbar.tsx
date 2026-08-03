'use client';

import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useState, useRef, useEffect } from 'react';
import { Menu, Search, Bell, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils/index';
import { ROUTES } from '@/lib/constants';
import { useUIStore } from '@/stores/ui.store';
import { useAuthStore } from '@/stores/auth.store';
import { useUnreadNotificationCount } from '@/hooks/use-user-data';
import { UserMenu } from './user-menu';

// ─── Inline search bar ────────────────────────────────────────────────────────

function TopSearchBar() {
  const router = useRouter();
  const pathname = usePathname();
  const isSearchPage = pathname === ROUTES.SEARCH;
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const q = query.trim();
    if (!q) return;
    router.push(`${ROUTES.SEARCH}?q=${encodeURIComponent(q)}`);
  };

  // On search page, focus on mount
  useEffect(() => {
    if (isSearchPage) inputRef.current?.focus();
  }, [isSearchPage]);

  return (
    <form onSubmit={handleSubmit} role="search" className="flex-1 max-w-md">
      <div className="relative">
        <Search
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground"
          aria-hidden
        />
        <input
          ref={inputRef}
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Artists, albums, tracks…"
          aria-label="Search music"
          className={cn(
            'w-full rounded-full bg-secondary border border-border',
            'pl-9 pr-4 py-2 text-sm text-foreground placeholder:text-muted-foreground/60',
            'outline-none transition-all duration-150',
            'focus:border-primary/50 focus:ring-2 focus:ring-ring/30',
          )}
        />
        {query && (
          <button
            type="button"
            onClick={() => setQuery('')}
            aria-label="Clear search"
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="h-3.5 w-3.5" aria-hidden />
          </button>
        )}
      </div>
    </form>
  );
}

// ─── History nav buttons ──────────────────────────────────────────────────────

function HistoryButtons() {
  const router = useRouter();
  return (
    <div className="hidden sm:flex items-center gap-1">
      <button
        type="button"
        onClick={() => router.back()}
        aria-label="Go back"
        className="flex h-7 w-7 items-center justify-center rounded-full bg-black/30 text-muted-foreground hover:text-foreground transition-colors"
      >
        <ChevronLeft className="h-4 w-4" aria-hidden />
      </button>
      <button
        type="button"
        onClick={() => router.forward()}
        aria-label="Go forward"
        className="flex h-7 w-7 items-center justify-center rounded-full bg-black/30 text-muted-foreground hover:text-foreground transition-colors"
      >
        <ChevronRight className="h-4 w-4" aria-hidden />
      </button>
    </div>
  );
}

// ─── Notification bell ────────────────────────────────────────────────────────

function NotificationBell() {
  const { data } = useUnreadNotificationCount();
  const unread = data?.count ?? 0;

  return (
    <Link
      href={ROUTES.NOTIFICATIONS}
      aria-label={unread > 0 ? `${unread} unread notifications` : 'Notifications'}
      className={cn(
        'relative flex h-8 w-8 items-center justify-center rounded-full',
        'text-muted-foreground hover:text-foreground hover:bg-secondary',
        'transition-colors duration-150',
      )}
    >
      <Bell className="h-4 w-4" aria-hidden />
      {unread > 0 && (
        <span
          className="absolute -right-0.5 -top-0.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-primary px-1 text-[9px] font-bold text-primary-foreground"
          aria-hidden
        >
          {unread > 9 ? '9+' : unread}
        </span>
      )}
    </Link>
  );
}

// ─── TopBar ───────────────────────────────────────────────────────────────────

export function TopBar() {
  const { openMobileDrawer } = useUIStore();
  const { isAuthenticated } = useAuthStore();

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/80">

      {/* Mobile hamburger */}
      <button
        type="button"
        onClick={openMobileDrawer}
        aria-label="Open navigation"
        className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors lg:hidden"
      >
        <Menu className="h-5 w-5" aria-hidden />
      </button>

      {/* Back/forward — desktop */}
      <HistoryButtons />

      {/* Search */}
      <TopSearchBar />

      {/* Right actions */}
      <div className="flex items-center gap-1.5 ml-auto">
        {isAuthenticated ? (
          <>
            <NotificationBell />
            <UserMenu />
          </>
        ) : (
          <div className="flex items-center gap-2">
            <Link
              href={ROUTES.LOGIN}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Sign in
            </Link>
            <Link
              href={ROUTES.REGISTER}
              className="rounded-full bg-primary px-4 py-1.5 text-sm font-medium text-primary-foreground hover:opacity-90 transition-opacity"
            >
              Sign up
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}