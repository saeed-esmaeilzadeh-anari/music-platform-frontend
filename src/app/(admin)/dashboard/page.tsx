'use client';

import Link from 'next/link';
import { Users, Mic2, AudioLines, Disc3, Sparkles, ArrowLeft, TrendingUp, Music } from 'lucide-react';
import { PageHeader } from '@/components/admin/page-header';
import { StatCard } from '@/components/admin/stat-card';
import { Card, CardBody, CardHeader, CardTitle } from '@/components/admin/card';
import { Table, TBody, Td, Th, THead, Tr } from '@/components/admin/table';
import { DonutChart, RatioBar } from '@/components/admin/charts';
import { RoleBadge, TrackStatusBadge } from '@/components/admin/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/admin/empty-state';
import { useAdminDashboard, useAdminUsers } from '@/hooks/use-admin';
import { useTracks } from '@/hooks/use-tracks';
import { useMe } from '@/hooks/use-user-data';
import { ROUTES } from '@/lib/constants';
import { formatJalaliShort } from '@/lib/utils/format-fa';
import { cn } from '@/lib/utils';

// ─── Greeting banner (Velzon "Section" equivalent) ────────────────────────────

function GreetingBanner() {
  const { data: me } = useMe();
  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? 'صبح بخیر' : hour < 17 ? 'ظهر بخیر' : 'شب بخیر';

  return (
    <div className={cn(
      'mb-6 overflow-hidden rounded-xl border border-border',
      'bg-gradient-to-l from-primary/5 via-background to-background',
    )}>
      <div className="flex items-center justify-between gap-4 px-6 py-5">
        <div className="min-w-0">
          <h2 className="text-lg font-bold text-foreground">
            {greeting}،{' '}
            <span className="text-primary">
              {me?.firstName || me?.username || 'مدیر'}
            </span>{' '}
            👋
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            در اینجا خلاصه‌ای از وضعیت امروز پلتفرم Soundwave آمده است.
          </p>
        </div>
        <div className="hidden shrink-0 sm:flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 border border-primary/20">
          <Music className="h-7 w-7 text-primary" aria-hidden />
        </div>
      </div>
    </div>
  );
}

// ─── Quick-action cards (Velzon ecommerce "best sellers" pattern) ─────────────

function QuickActions() {
  const actions = [
    { href: ROUTES.ADMIN_USERS,   label: 'مدیریت کاربران',  desc: 'مشاهده، تعلیق، یا حذف',        icon: Users,      tone: 'info'    },
    { href: ROUTES.ADMIN_TRACKS,  label: 'مدیریت آهنگ‌ها',  desc: 'بازبینی و ویرایش محتوا',        icon: AudioLines, tone: 'success' },
    { href: ROUTES.ADMIN_GENRES,  label: 'مدیریت ژانرها',   desc: 'افزودن یا ویرایش ژانرها',       icon: TrendingUp, tone: 'primary' },
  ] as const;

  const TONE_CLS = {
    info:    'bg-sky-500/10 text-sky-400 border-sky-500/20',
    success: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    primary: 'bg-primary/10 text-primary border-primary/20',
  };

  return (
    <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-3">
      {actions.map((a) => {
        const Icon = a.icon;
        return (
          <Link
            key={a.href}
            href={a.href}
            className={cn(
              'group flex items-center gap-4 rounded-xl border border-border bg-card p-4',
              'transition-all duration-200 hover:-translate-y-0.5 hover:border-border/80 hover:shadow-md',
            )}
          >
            <div className={cn(
              'flex h-11 w-11 shrink-0 items-center justify-center rounded-full border',
              TONE_CLS[a.tone],
            )}>
              <Icon className="h-5 w-5" aria-hidden />
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
                {a.label}
              </p>
              <p className="mt-0.5 truncate text-xs text-muted-foreground">{a.desc}</p>
            </div>
            <ArrowLeft className="ms-auto h-4 w-4 shrink-0 text-muted-foreground/40 group-hover:text-primary transition-colors" />
          </Link>
        );
      })}
    </div>
  );
}

// ─── Dashboard page ────────────────────────────────────────────────────────────

export default function AdminDashboardPage() {
  const { data: stats, isLoading: statsLoading } = useAdminDashboard();
  const { data: recentUsers,  isLoading: usersLoading  } = useAdminUsers({ page: 1, limit: 5 });
  const { data: recentTracks, isLoading: tracksLoading } = useTracks({ page: 1, limit: 5 });

  return (
    <div>
      <PageHeader
        title="داشبورد مدیریت"
        description="نمای کلی از وضعیت کاربران، هنرمندان و محتوای پلتفرم Soundwave."
      />

      {/* Greeting banner */}
      <GreetingBanner />

      {/* KPI stat cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <StatCard
          label="کاربران"
          value={stats?.totalUsers ?? 0}
          icon={Users}
          tone="primary"
          loading={statsLoading}
          hint="کل کاربران ثبت‌شده"
        />
        <StatCard
          label="هنرمندان"
          value={stats?.totalArtists ?? 0}
          icon={Mic2}
          tone="info"
          loading={statsLoading}
          hint="هنرمندان فعال"
        />
        <StatCard
          label="آهنگ‌ها"
          value={stats?.totalTracks ?? 0}
          icon={AudioLines}
          tone="success"
          loading={statsLoading}
          hint="آهنگ‌های بارگذاری‌شده"
        />
        <StatCard
          label="آلبوم‌ها"
          value={stats?.totalAlbums ?? 0}
          icon={Disc3}
          tone="warning"
          loading={statsLoading}
          hint="آلبوم‌های منتشرشده"
        />
        <StatCard
          label="اشتراک‌های فعال"
          value={stats?.activeSubscriptions ?? 0}
          icon={Sparkles}
          tone="danger"
          loading={statsLoading}
          hint="مشترکان پریمیوم"
        />
      </div>

      {/* Quick actions */}
      <QuickActions />

      {/* Charts row */}
      <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-5">
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>ترکیب محتوا</CardTitle>
          </CardHeader>
          <CardBody>
            {statsLoading ? (
              <Skeleton className="mx-auto h-[168px] w-[168px] rounded-full" />
            ) : (
              <DonutChart
                segments={[
                  { label: 'هنرمندان', value: stats?.totalArtists ?? 0, colorVar: 'hsl(var(--primary))' },
                  { label: 'آلبوم‌ها',  value: stats?.totalAlbums  ?? 0, colorVar: 'hsl(38 92% 50%)'    },
                  { label: 'آهنگ‌ها',   value: stats?.totalTracks  ?? 0, colorVar: 'hsl(160 60% 45%)'   },
                ]}
              />
            )}
          </CardBody>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>نسبت اشتراک به کاربران</CardTitle>
          </CardHeader>
          <CardBody className="flex h-full flex-col justify-center gap-6">
            {statsLoading ? (
              <Skeleton className="h-2.5 w-full rounded-full" />
            ) : (
              <RatioBar
                label="اشتراک‌های فعال"
                numerator={stats?.activeSubscriptions ?? 0}
                denominator={stats?.totalUsers ?? 0}
              />
            )}
            <p className="text-xs leading-relaxed text-muted-foreground">
              این نسبت، سهم کاربرانی را نشان می‌دهد که در حال حاضر اشتراک فعال دارند و می‌تواند
              شاخصی برای نرخ تبدیل کاربران رایگان به مشترک باشد.
            </p>
          </CardBody>
        </Card>
      </div>

      {/* Recent data tables */}
      <div className="mt-5 grid grid-cols-1 gap-5 xl:grid-cols-2">
        {/* Recent users */}
        <Card>
          <CardHeader>
            <CardTitle>کاربران اخیر</CardTitle>
            <Link
              href={ROUTES.ADMIN_USERS}
              className="flex items-center gap-1 text-xs font-medium text-primary hover:underline"
            >
              مشاهدهٔ همه
              <ArrowLeft className="h-3.5 w-3.5" />
            </Link>
          </CardHeader>
          {usersLoading ? (
            <CardBody className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </CardBody>
          ) : !recentUsers?.items.length ? (
            <EmptyState title="کاربری یافت نشد" />
          ) : (
            <Table>
              <THead>
                <tr>
                  <Th>کاربر</Th>
                  <Th>نقش</Th>
                  <Th>تاریخ عضویت</Th>
                </tr>
              </THead>
              <TBody>
                {recentUsers.items.map((u) => (
                  <Tr key={u.id}>
                    <Td>
                      <div>
                        <p className="font-medium">{u.username}</p>
                        <p className="text-xs text-muted-foreground">{u.email}</p>
                      </div>
                    </Td>
                    <Td>
                      <RoleBadge role={u.role} />
                    </Td>
                    <Td className="text-muted-foreground">{formatJalaliShort(u.createdAt)}</Td>
                  </Tr>
                ))}
              </TBody>
            </Table>
          )}
        </Card>

        {/* Recent tracks */}
        <Card>
          <CardHeader>
            <CardTitle>آهنگ‌های اخیر</CardTitle>
            <Link
              href={ROUTES.ADMIN_TRACKS}
              className="flex items-center gap-1 text-xs font-medium text-primary hover:underline"
            >
              مشاهدهٔ همه
              <ArrowLeft className="h-3.5 w-3.5" />
            </Link>
          </CardHeader>
          {tracksLoading ? (
            <CardBody className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </CardBody>
          ) : !recentTracks?.items.length ? (
            <EmptyState title="آهنگی یافت نشد" />
          ) : (
            <Table>
              <THead>
                <tr>
                  <Th>عنوان</Th>
                  <Th>هنرمند</Th>
                  <Th>وضعیت</Th>
                </tr>
              </THead>
              <TBody>
                {recentTracks.items.map((t) => (
                  <Tr key={t.id}>
                    <Td className="font-medium">{t.title}</Td>
                    <Td className="text-muted-foreground">{t.artist.stageName}</Td>
                    <Td>
                      <TrackStatusBadge status={t.status} />
                    </Td>
                  </Tr>
                ))}
              </TBody>
            </Table>
          )}
        </Card>
      </div>
    </div>
  );
}
