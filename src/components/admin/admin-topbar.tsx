'use client';

import { Menu, Bell, LogOut, User as UserIcon, ExternalLink } from 'lucide-react';
import { ROUTES } from '@/lib/constants';
import { FA_ROLE_LABELS } from '@/lib/constants/admin';
import { useLogout } from '@/hooks/use-auth';
import { useMe, useUnreadNotificationCount } from '@/hooks/use-user-data';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toFaDigits } from '@/lib/utils/format-fa';
import Link from 'next/link';

function initialsOf(username?: string) {
  if (!username) return '؟';
  return username.slice(0, 2).toUpperCase();
}

interface AdminTopbarProps {
  onMenuClick: () => void;
}

export function AdminTopbar({ onMenuClick }: AdminTopbarProps) {
  // useMe() shares the same query key AuthProvider primes on boot, so this
  // reads from cache rather than firing a second request — but it exposes
  // the full profile (firstName, avatarUrl) that the lightweight Zustand
  // store intentionally leaves out.
  const { data: me } = useMe();
  const logout = useLogout();
  const { data: unread } = useUnreadNotificationCount();

  return (
    <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center justify-between border-b border-border bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/80 sm:px-6">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onMenuClick}
          className="rounded-md p-2 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground lg:hidden"
          aria-label="باز کردن منو"
        >
          <Menu className="h-5 w-5" />
        </button>
        <p className="hidden text-sm text-muted-foreground sm:block">
          خوش آمدید،{' '}
          <span className="font-medium text-foreground">
            {me?.firstName || me?.username || 'مدیر'}
          </span>
        </p>
      </div>

      <div className="flex items-center gap-2">
        <Link
          href={ROUTES.BROWSE}
          className="hidden items-center gap-1.5 rounded-md px-3 py-2 text-xs font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground md:flex"
        >
          <ExternalLink className="h-3.5 w-3.5" />
          مشاهدهٔ سایت
        </Link>

        <button
          type="button"
          className="relative rounded-md p-2 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
          aria-label="اعلان‌ها"
        >
          <Bell className="h-[18px] w-[18px]" />
          {!!unread?.count && (
            <span className="absolute end-1 top-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-bold leading-none text-destructive-foreground">
              {toFaDigits(unread.count > 9 ? '9+' : String(unread.count))}
            </span>
          )}
        </button>

        <DropdownMenu>
          <DropdownMenuTrigger className="flex items-center gap-2.5 rounded-md p-1.5 outline-none transition-colors hover:bg-secondary">
            <Avatar className="h-8 w-8">
              <AvatarImage src={me?.avatarUrl ?? undefined} alt={me?.username ?? ''} />
              <AvatarFallback>{initialsOf(me?.username)}</AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel className="normal-case tracking-normal">
              <p className="text-sm font-semibold text-foreground">
                {me?.firstName ? `${me.firstName} ${me.lastName ?? ''}`.trim() : me?.username}
              </p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {me?.role ? FA_ROLE_LABELS[me.role] : ''} · {me?.email}
              </p>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href={ROUTES.PROFILE} className="flex items-center gap-2.5">
                <UserIcon className="h-4 w-4" />
                پروفایل من
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              destructive
              onClick={() => logout.mutate()}
              className="flex items-center gap-2.5"
            >
              <LogOut className="h-4 w-4" />
              خروج از حساب
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
