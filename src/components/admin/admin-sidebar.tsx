'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  Mic2,
  Disc3,
  AudioLines,
  Tags,
  X,
  ExternalLink,
} from 'lucide-react';
import { ROUTES } from '@/lib/constants';
import { cn } from '@/lib/utils';

interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

const NAV_SECTIONS: { title: string; items: NavItem[] }[] = [
  {
    title: 'کلی',
    items: [{ href: ROUTES.ADMIN, label: 'داشبورد', icon: LayoutDashboard }],
  },
  {
    title: 'مدیریت جامعه',
    items: [
      { href: ROUTES.ADMIN_USERS,   label: 'کاربران',  icon: Users  },
      { href: ROUTES.ADMIN_ARTISTS, label: 'هنرمندان', icon: Mic2   },
    ],
  },
  {
    title: 'مدیریت محتوا',
    items: [
      { href: ROUTES.ADMIN_ALBUMS, label: 'آلبوم‌ها', icon: Disc3     },
      { href: ROUTES.ADMIN_TRACKS, label: 'آهنگ‌ها',  icon: AudioLines },
      { href: ROUTES.ADMIN_GENRES, label: 'ژانرها',   icon: Tags       },
    ],
  },
];

function BrandMark() {
  return (
    <Link href={ROUTES.ADMIN} className="group flex items-center gap-2.5" aria-label="داشبورد Soundwave">
      <span className="flex h-8 items-end gap-[3px]" aria-hidden>
        {[3, 5, 7, 5, 4].map((h, i) => (
          <span
            key={i}
            className="w-[3px] rounded-full bg-primary transition-colors group-hover:bg-primary/70"
            style={{ height: `${h * 3}px` }}
          />
        ))}
      </span>
      <span className="flex flex-col leading-tight">
        <span className="text-sm font-bold tracking-tight text-foreground">Soundwave</span>
        <span className="text-[11px] text-muted-foreground">پنل مدیریت</span>
      </span>
    </Link>
  );
}

interface AdminSidebarProps {
  mobileOpen: boolean;
  onClose: () => void;
}

export function AdminSidebar({ mobileOpen, onClose }: AdminSidebarProps) {
  const pathname = usePathname();

  const content = (
    <>
      {/* Brand header */}
      <div className="flex h-16 shrink-0 items-center justify-between border-b border-border px-5">
        <BrandMark />
        <button
          type="button"
          onClick={onClose}
          className="rounded-md p-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground lg:hidden"
          aria-label="بستن منو"
        >
          <X className="h-[18px] w-[18px]" />
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-4" aria-label="ناوبری مدیریت">
        {NAV_SECTIONS.map((section) => (
          <div key={section.title} className="mb-4 last:mb-0">
            {/* Section heading — matches Velzon's sidebar group labels */}
            <p className="mb-1.5 px-3 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60">
              {section.title}
            </p>
            <ul className="space-y-0.5" role="list">
              {section.items.map((item) => {
                const active = pathname === item.href || pathname.startsWith(item.href + '/');
                const Icon   = item.icon;
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={onClose}
                      className={cn(
                        'relative flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-all duration-150',
                        active
                          ? 'bg-primary/12 text-primary'
                          : 'text-muted-foreground hover:bg-secondary hover:text-foreground',
                      )}
                    >
                      {/* Velzon-style active left-border accent */}
                      {active && (
                        <span
                          className="absolute end-0 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-full bg-primary"
                          aria-hidden
                        />
                      )}
                      <Icon
                        className={cn(
                          'h-[18px] w-[18px] shrink-0 transition-colors',
                          active ? 'text-primary' : 'text-muted-foreground/70',
                        )}
                      />
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="shrink-0 border-t border-border p-3">
        <Link
          href={ROUTES.BROWSE}
          className="flex items-center gap-2.5 rounded-md px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
        >
          <ExternalLink className="h-4 w-4 shrink-0" />
          بازگشت به سایت
        </Link>
      </div>
    </>
  );

  return (
    <>
      {/* Desktop — fixed, always visible */}
      <aside className="hidden w-sidebar shrink-0 flex-col border-e border-border bg-sidebar-bg lg:flex">
        {content}
      </aside>

      {/* Mobile — off-canvas drawer */}
      <div
        className={cn(
          'fixed inset-0 z-40 lg:hidden',
          mobileOpen ? 'pointer-events-auto' : 'pointer-events-none',
        )}
        role="dialog"
        aria-modal="true"
        aria-label="منوی ناوبری"
      >
        {/* Backdrop */}
        <div
          className={cn(
            'absolute inset-0 bg-background/80 backdrop-blur-sm transition-opacity duration-200',
            mobileOpen ? 'opacity-100' : 'opacity-0',
          )}
          onClick={onClose}
        />
        {/* Drawer */}
        <aside
          className={cn(
            'absolute top-0 flex h-full w-[280px] flex-col bg-sidebar-bg shadow-2xl transition-transform duration-200 ease-out',
            'start-0',
            mobileOpen ? 'translate-x-0' : 'rtl:translate-x-full ltr:-translate-x-full',
          )}
        >
          {content}
        </aside>
      </div>
    </>
  );
}
