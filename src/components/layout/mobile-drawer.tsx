'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { X, Home, Search, Library, Heart, History, Upload, LayoutDashboard } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ROUTES } from '@/lib/constants';
import { useUIStore } from '@/stores/ui.store';
import { useAuthStore } from '@/stores/auth.store';
import { SidebarWordmark } from './sidebar-wordmark';

const NAV = [
  { label: 'Browse',     href: ROUTES.BROWSE,        icon: Home },
  { label: 'Search',     href: ROUTES.SEARCH,         icon: Search },
  { label: 'Library',    href: ROUTES.LIBRARY,        icon: Library },
  { label: 'Favourites', href: ROUTES.LIBRARY,        icon: Heart },
  { label: 'History',    href: ROUTES.HISTORY,        icon: History },
];

const ARTIST_NAV = [
  { label: 'Upload',     href: ROUTES.UPLOAD,         icon: Upload },
];

const ADMIN_NAV = [
  { label: 'Dashboard',  href: ROUTES.ADMIN,          icon: LayoutDashboard },
];

export function MobileDrawer() {
  const { mobileDrawerOpen, closeMobileDrawer } = useUIStore();
  const { user } = useAuthStore();
  const pathname = usePathname();

  // Close drawer on route change
  useEffect(() => { closeMobileDrawer(); }, [pathname, closeMobileDrawer]);

  // Lock body scroll when open
  useEffect(() => {
    document.body.style.overflow = mobileDrawerOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileDrawerOpen]);

  if (!mobileDrawerOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/70 lg:hidden animate-fade-in"
        aria-hidden
        onClick={closeMobileDrawer}
      />

      {/* Drawer panel */}
      <div
        role="dialog"
        aria-label="Navigation"
        aria-modal="true"
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex w-72 flex-col',
          'bg-sidebar-bg border-r border-border',
          'lg:hidden animate-slide-in-right',
          // Override direction: slide from left
          '[animation-name:slide-in-left]',
        )}
      >
        {/* Header */}
        <div className="flex h-16 items-center justify-between border-b border-border px-4">
          <SidebarWordmark />
          <button
            onClick={closeMobileDrawer}
            aria-label="Close navigation"
            className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
          >
            <X className="h-4 w-4" aria-hidden />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto p-3 space-y-0.5">
          {NAV.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.label}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-primary/15 text-primary'
                    : 'text-muted-foreground hover:bg-secondary hover:text-foreground',
                )}
              >
                <Icon className="h-4 w-4 shrink-0" aria-hidden />
                {item.label}
              </Link>
            );
          })}

          {(user?.role === 'ARTIST' || user?.role === 'ADMIN') && (
            <>
              <p className="mt-4 mb-1 px-3 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60">
                Artist
              </p>
              {ARTIST_NAV.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    className="flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
                  >
                    <Icon className="h-4 w-4 shrink-0" aria-hidden />
                    {item.label}
                  </Link>
                );
              })}
            </>
          )}

          {user?.role === 'ADMIN' && (
            <>
              <p className="mt-4 mb-1 px-3 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60">
                Admin
              </p>
              {ADMIN_NAV.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    className="flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
                  >
                    <Icon className="h-4 w-4 shrink-0" aria-hidden />
                    {item.label}
                  </Link>
                );
              })}
            </>
          )}
        </nav>
      </div>
    </>
  );
}