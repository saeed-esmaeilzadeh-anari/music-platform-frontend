'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home,
  Search,
  Library,
  Heart,
  History,
  Upload,
  LayoutDashboard,
  ChevronLeft,
  ChevronRight,
  Plus,
} from 'lucide-react';

import { cn } from '@/lib/utils';
import { ROUTES } from '@/lib/constants';
import { useUIStore } from '@/stores/ui.store';
import { useAuthStore } from '@/stores/auth.store';
import { useMyPlaylists } from '@/hooks/use-playlists';
import { SidebarWordmark } from './sidebar-wordmark';

// ─── Nav item definition ──────────────────────────────────────────────────────

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
  /** If provided, only users with these roles see this item */
  roles?: string[];
}

const PRIMARY_NAV: NavItem[] = [
  { label: 'Browse',   href: ROUTES.BROWSE,   icon: Home },
  { label: 'Search',   href: ROUTES.SEARCH,   icon: Search },
  { label: 'Library',  href: ROUTES.LIBRARY,  icon: Library },
];

const PERSONAL_NAV: NavItem[] = [
  { label: 'Favourites', href: ROUTES.LIBRARY, icon: Heart },
  { label: 'History',    href: ROUTES.HISTORY, icon: History },
  { label: 'Upload',     href: ROUTES.UPLOAD,  icon: Upload,  roles: ['ARTIST', 'ADMIN'] },
];

const ADMIN_NAV: NavItem[] = [
  { label: 'Dashboard', href: ROUTES.ADMIN,        icon: LayoutDashboard },
];

// ─── Single nav link ──────────────────────────────────────────────────────────

interface NavLinkProps {
  item: NavItem;
  collapsed: boolean;
}

function NavLink({ item, collapsed }: NavLinkProps) {
  const pathname = usePathname();
  const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
  const Icon = item.icon;

  return (
    <Link
      href={item.href}
      title={collapsed ? item.label : undefined}
      className={cn(
        'group flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium',
        'transition-all duration-150 select-none',
        isActive
          ? 'bg-primary/15 text-primary'
          : 'text-muted-foreground hover:bg-secondary hover:text-foreground',
        collapsed && 'justify-center px-2',
      )}
    >
      <Icon
        className={cn(
          'shrink-0 transition-colors',
          collapsed ? 'h-5 w-5' : 'h-4 w-4',
          isActive ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground',
        )}
        aria-hidden
      />
      {!collapsed && <span className="truncate">{item.label}</span>}
      {/* Active indicator bar */}
      {isActive && !collapsed && (
        <span className="ml-auto h-1.5 w-1.5 rounded-full bg-primary shrink-0" aria-hidden />
      )}
    </Link>
  );
}

// ─── Section heading ──────────────────────────────────────────────────────────

function SectionLabel({ label, collapsed }: { label: string; collapsed: boolean }) {
  if (collapsed) return <div className="my-2 h-px bg-border mx-2" />;
  return (
    <p className="mt-5 mb-1.5 px-3 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60">
      {label}
    </p>
  );
}

// ─── Playlists list ───────────────────────────────────────────────────────────

function PlaylistList({ collapsed }: { collapsed: boolean }) {
  const { data } = useMyPlaylists({ limit: 8 });
  const pathname = usePathname();

  if (collapsed || !data?.items.length) return null;

  return (
    <div className="mt-1 space-y-0.5">
      {data.items.map((pl) => {
        const href = ROUTES.PLAYLIST(pl.id);
        const isActive = pathname === href;
        return (
          <Link
            key={pl.id}
            href={href}
            className={cn(
              'flex items-center gap-2.5 rounded-md px-3 py-2 text-sm',
              'transition-colors duration-150 truncate',
              isActive
                ? 'text-foreground bg-secondary'
                : 'text-muted-foreground hover:text-foreground hover:bg-secondary',
            )}
          >
            {/* Small square cover placeholder */}
            <span
              className="h-7 w-7 shrink-0 rounded bg-secondary border border-border flex items-center justify-center"
              aria-hidden
            >
              <Library className="h-3 w-3 text-muted-foreground/50" />
            </span>
            <span className="truncate">{pl.title}</span>
          </Link>
        );
      })}
    </div>
  );
}

// ─── Main Sidebar ─────────────────────────────────────────────────────────────

export function Sidebar() {
  const { sidebarCollapsed, toggleSidebar } = useUIStore();
  const { user } = useAuthStore();

  const isAdmin = user?.role === 'ADMIN';
  const isArtistOrAdmin = user?.role === 'ARTIST' || user?.role === 'ADMIN';

  return (
    <aside
      className={cn(
        'hidden lg:flex flex-col bg-sidebar-bg border-r border-border',
        'transition-[width] duration-200 ease-in-out shrink-0',
        sidebarCollapsed ? 'w-[72px]' : 'w-[240px]',
      )}
      aria-label="Main navigation"
    >
      {/* Top — wordmark + collapse toggle */}
      <div
        className={cn(
          'flex h-16 items-center border-b border-border px-3',
          sidebarCollapsed ? 'justify-center' : 'justify-between',
        )}
      >
        {!sidebarCollapsed && <SidebarWordmark />}
        <button
          onClick={toggleSidebar}
          aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          className={cn(
            'flex h-7 w-7 items-center justify-center rounded-md',
            'text-muted-foreground hover:bg-secondary hover:text-foreground',
            'transition-colors duration-150 shrink-0',
          )}
        >
          {sidebarCollapsed ? (
            <ChevronRight className="h-4 w-4" aria-hidden />
          ) : (
            <ChevronLeft className="h-4 w-4" aria-hidden />
          )}
        </button>
      </div>

      {/* Scrollable nav area */}
      <nav className="flex-1 overflow-y-auto overflow-x-hidden px-2 py-3">

        {/* Primary */}
        <div className="space-y-0.5">
          {PRIMARY_NAV.map((item) => (
            <NavLink key={item.href} item={item} collapsed={sidebarCollapsed} />
          ))}
        </div>

        {/* Personal */}
        <SectionLabel label="Your music" collapsed={sidebarCollapsed} />
        <div className="space-y-0.5">
          {PERSONAL_NAV
            .filter((item) => !item.roles || (user && item.roles.includes(user.role)))
            .map((item) => (
              <NavLink key={item.href} item={item} collapsed={sidebarCollapsed} />
            ))}
        </div>

        {/* Playlists (hidden when collapsed) */}
        {!sidebarCollapsed && (
          <>
            <div className="mt-5 mb-1.5 flex items-center justify-between px-3">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60">
                Playlists
              </p>
              <Link
                href={ROUTES.LIBRARY}
                title="New playlist"
                className="rounded p-0.5 text-muted-foreground hover:text-foreground transition-colors"
              >
                <Plus className="h-3.5 w-3.5" aria-hidden />
              </Link>
            </div>
            <PlaylistList collapsed={sidebarCollapsed} />
          </>
        )}

        {/* Admin */}
        {isAdmin && (
          <>
            <SectionLabel label="Admin" collapsed={sidebarCollapsed} />
            <div className="space-y-0.5">
              {ADMIN_NAV.map((item) => (
                <NavLink key={item.href} item={item} collapsed={sidebarCollapsed} />
              ))}
            </div>
          </>
        )}
      </nav>
    </aside>
  );
}