'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import {
  User,
  Settings,
  CreditCard,
  History,
  Bell,
  LogOut,
  ChevronDown,
  ShieldCheck,
  Upload,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { getInitials, formatCount } from '@/lib/utils';
import { ROUTES, ROLE_LABELS } from '@/lib/constants';
import { useAuthStore } from '@/stores/auth.store';
import { useLogout } from '@/hooks/use-auth';
import { useUnreadNotificationCount } from '@/hooks/use-user-data';

// ─── Avatar ───────────────────────────────────────────────────────────────────

function Avatar({ username, avatarUrl, size = 'md' }: { username: string; avatarUrl?: string | null; size?: 'sm' | 'md' }) {
  const sizeClasses = size === 'sm' ? 'h-7 w-7 text-[11px]' : 'h-8 w-8 text-xs';
  return (
    <span
      className={cn(
        'inline-flex shrink-0 items-center justify-center rounded-full',
        'bg-primary/20 text-primary font-semibold select-none',
        sizeClasses,
      )}
      aria-hidden
    >
      {avatarUrl ? (
        <img src={avatarUrl} alt="" className="h-full w-full rounded-full object-cover" />
      ) : (
        getInitials(username)
      )}
    </span>
  );
}

// ─── Menu item ────────────────────────────────────────────────────────────────

interface MenuItemProps {
  href?: string;
  onClick?: () => void;
  icon: React.ElementType;
  label: string;
  badge?: string | number;
  destructive?: boolean;
}

function MenuItem({ href, onClick, icon: Icon, label, badge, destructive }: MenuItemProps) {
  const base = cn(
    'flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors duration-150',
    destructive
      ? 'text-destructive hover:bg-destructive/10'
      : 'text-muted-foreground hover:bg-secondary hover:text-foreground',
  );

  const content = (
    <>
      <Icon className="h-4 w-4 shrink-0" aria-hidden />
      <span className="flex-1 text-left">{label}</span>
      {badge !== undefined && (
        <span className="flex h-4 min-w-[16px] items-center justify-center rounded-full bg-primary px-1 text-[10px] font-semibold text-primary-foreground">
          {badge}
        </span>
      )}
    </>
  );

  if (href) {
    return <Link href={href} className={base}>{content}</Link>;
  }

  return (
    <button type="button" onClick={onClick} className={base}>
      {content}
    </button>
  );
}

// ─── UserMenu ─────────────────────────────────────────────────────────────────

export function UserMenu() {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const { user } = useAuthStore();
  const logoutMutation = useLogout();
  const { data: unreadData } = useUnreadNotificationCount();
  const unreadCount = unreadData?.count ?? 0;

  // Close on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);

  // Close on Escape
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }
    if (open) document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [open]);

  if (!user) return null;

  const handleLogout = () => {
    setOpen(false);
    logoutMutation.mutate();
  };

  return (
    <div ref={menuRef} className="relative">
      {/* Trigger */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="User menu"
        className={cn(
          'flex items-center gap-2 rounded-full pl-1 pr-2 py-1',
          'border border-transparent hover:border-border hover:bg-secondary',
          'transition-all duration-150 outline-none focus-visible:ring-2 focus-visible:ring-ring',
        )}
      >
        <Avatar username={user.username} />
        <span className="hidden sm:block max-w-[100px] truncate text-sm font-medium text-foreground">
          {user.username}
        </span>
        {unreadCount > 0 && (
          <span className="hidden sm:flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[9px] font-bold text-primary-foreground">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
        <ChevronDown
          className={cn('hidden sm:block h-3.5 w-3.5 text-muted-foreground transition-transform duration-150', open && 'rotate-180')}
          aria-hidden
        />
      </button>

      {/* Dropdown */}
      {open && (
        <div
          role="menu"
          className={cn(
            'absolute right-0 top-full mt-2 z-50',
            'w-60 rounded-lg border border-border bg-card shadow-xl',
            'animate-fade-in',
          )}
        >
          {/* User info header */}
          <div className="flex items-center gap-3 border-b border-border px-4 py-3">
            <Avatar username={user.username} size="md" />
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-foreground">{user.username}</p>
              <p className="truncate text-xs text-muted-foreground">{user.email}</p>
            </div>
          </div>

          {/* Role badge */}
          <div className="px-3 py-2 border-b border-border">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/15 px-2.5 py-1 text-[11px] font-medium text-primary">
              <ShieldCheck className="h-3 w-3" aria-hidden />
              {ROLE_LABELS[user.role]}
            </span>
          </div>

          {/* Menu items */}
          <nav className="p-1.5 space-y-0.5" role="none">
            <MenuItem href={ROUTES.PROFILE}       icon={User}     label="Profile" />
            <MenuItem href={ROUTES.NOTIFICATIONS} icon={Bell}     label="Notifications" badge={unreadCount > 0 ? unreadCount : undefined} />
            <MenuItem href={ROUTES.HISTORY}       icon={History}  label="Listening history" />
            {(user.role === 'ARTIST' || user.role === 'ADMIN') && (
              <MenuItem href={ROUTES.UPLOAD}      icon={Upload}   label="Upload track" />
            )}
            <MenuItem href={ROUTES.SUBSCRIPTION}  icon={CreditCard} label="Subscription" />
            <MenuItem href={ROUTES.SETTINGS}      icon={Settings} label="Settings" />
          </nav>

          <div className="border-t border-border p-1.5">
            <MenuItem
              icon={LogOut}
              label={logoutMutation.isPending ? 'Signing out…' : 'Sign out'}
              onClick={handleLogout}
              destructive
            />
          </div>
        </div>
      )}
    </div>
  );
}