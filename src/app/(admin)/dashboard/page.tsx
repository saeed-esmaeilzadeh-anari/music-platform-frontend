'use client';

import Link from 'next/link';
import type { LucideIcon } from 'lucide-react';
import {
  Activity,
  ArrowLeft,
  AudioLines,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Disc3,
  ExternalLink,
  Layers3,
  Mic2,
  Music2,
  RefreshCw,
  Sparkles,
  Users,
} from 'lucide-react';
import { PageHeader } from '@/components/admin/page-header';
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
import { formatFaNumber, formatJalaliDate, formatJalaliShort } from '@/lib/utils/format-fa';
import type { TrackStatus } from '@/types';
import { cn } from '@/lib/utils';

type Tone = 'violet' | 'blue' | 'green' | 'amber' | 'rose';

const toneStyles: Record<Tone, { icon: string; accent: string; border: string }> = {
  violet: {
    icon: 'bg-violet-500/12 text-violet-300 ring-violet-400/20',
    accent: 'from-violet-500/15',
    border: 'hover:border-violet-400/35',
  },
  blue: {
    icon: 'bg-sky-500/12 text-sky-300 ring-sky-400/20',
    accent: 'from-sky-500/15',
    border: 'hover:border-sky-400/35',
  },
  green: {
    icon: 'bg-emerald-500/12 text-emerald-300 ring-emerald-400/20',
    accent: 'from-emerald-500/15',
    border: 'hover:border-emerald-400/35',
  },
  amber: {
    icon: 'bg-amber-500/12 text-amber-300 ring-amber-400/20',
    accent: 'from-amber-500/15',
    border: 'hover:border-amber-400/35',
  },
  rose: {
    icon: 'bg-rose-500/12 text-rose-300 ring-rose-400/20',
    accent: 'from-rose-500/15',
    border: 'hover:border-rose-400/35',
  },
};

function MetricCard({
  label,
  value,
  description,
  icon: Icon,
  tone,
  loading,
}: {
  label: string;
  value: number;
  description: string;
  icon: LucideIcon;
  tone: Tone;
  loading: boolean;
}) {
  const style = toneStyles[tone];

  return (
    <article
      className={cn(
        'group relative min-w-0 overflow-hidden rounded-2xl border border-border bg-card p-4 shadow-sm',
        'transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg sm:p-5',
        style.border,
      )}
    >
      <div className={cn('pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b to-transparent opacity-70', style.accent)} />
      <div className="relative flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-medium text-muted-foreground sm:text-sm">{label}</p>
          {loading ? (
            <Skeleton className="mt-3 h-8 w-24" />
          ) : (
            <p className="mt-2 text-2xl font-bold tracking-tight text-foreground sm:text-3xl" dir="ltr">
              {formatFaNumber(value)}
            </p>
          )}
          <p className="mt-2 text-xs leading-5 text-muted-foreground">{description}</p>
        </div>
        <span className={cn('flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ring-1 ring-inset sm:h-12 sm:w-12', style.icon)}>
          <Icon className="h-5 w-5 sm:h-[22px] sm:w-[22px]" aria-hidden />
        </span>
      </div>
      <div className="relative mt-4 h-1 overflow-hidden rounded-full bg-secondary">
        <div className={cn('h-full w-2/3 rounded-full bg-gradient-to-l to-transparent opacity-70', style.accent.replace('from-', 'from-').replace('/15', '/80'))} />
      </div>
    </article>
  );
}

function DashboardWelcome() {
  const { data: me } = useMe();
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'صبح بخیر' : hour < 17 ? 'روز بخیر' : 'شب بخیر';

  return (
    <section className="relative mb-6 overflow-hidden rounded-2xl border border-primary/20 bg-gradient-to-l from-primary/15 via-card to-card">
      <div className="pointer-events-none absolute -left-12 -top-20 h-56 w-56 rounded-full bg-primary/10 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 left-1/3 h-24 w-24 rounded-full bg-fuchsia-500/10 blur-2xl" />
      <div className="relative flex flex-col gap-5 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-7">
        <div className="min-w-0">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-[11px] font-medium text-primary">
            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
            نمای کلی پلتفرم
          </div>
          <h2 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
            {greeting}، <span className="text-primary">{me?.firstName || me?.username || 'مدیر عزیز'}</span>
            <span className="mr-2" aria-hidden>👋</span>
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
            وضعیت کاربران، کتابخانه موسیقی و اشتراک‌ها را از یک نگاه بررسی و مدیریت کنید.
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-3 rounded-xl border border-border/80 bg-background/65 px-4 py-3 backdrop-blur">
          <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <CalendarDays className="h-5 w-5" />
          </span>
          <div>
            <p className="text-[11px] text-muted-foreground">امروز</p>
            <p className="mt-1 text-sm font-semibold text-foreground">{formatJalaliDate(new Date())}</p>
          </div>
        </div>
      </div>
    </section>
  );
}

function QuickActions() {
  const actions: {
    href: string;
    label: string;
    description: string;
    icon: LucideIcon;
    tone: Tone;
  }[] = [
    { href: ROUTES.ADMIN_USERS, label: 'کاربران', description: 'مدیریت حساب‌ها و دسترسی‌ها', icon: Users, tone: 'blue' },
    { href: ROUTES.ADMIN_ARTISTS, label: 'هنرمندان', description: 'بررسی پروفایل هنرمندان', icon: Mic2, tone: 'violet' },
    { href: ROUTES.ADMIN_TRACKS, label: 'آهنگ‌ها', description: 'بازبینی و انتشار محتوا', icon: AudioLines, tone: 'green' },
    { href: ROUTES.ADMIN_ALBUMS, label: 'آلبوم‌ها', description: 'مدیریت مجموعه‌های موسیقی', icon: Disc3, tone: 'amber' },
  ];

  return (
    <section className="mt-6">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h2 className="text-sm font-bold text-foreground sm:text-base">دسترسی سریع</h2>
        <span className="text-xs text-muted-foreground">میان‌برهای مدیریتی</span>
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {actions.map(({ href, label, description, icon: Icon, tone }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              'group flex min-w-0 items-center gap-3 rounded-xl border border-border bg-card p-4',
              'transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md',
              toneStyles[tone].border,
            )}
          >
            <span className={cn('flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ring-1 ring-inset', toneStyles[tone].icon)}>
              <Icon className="h-5 w-5" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-semibold text-foreground transition-colors group-hover:text-primary">{label}</span>
              <span className="mt-1 block truncate text-xs text-muted-foreground">{description}</span>
            </span>
            <ArrowLeft className="h-4 w-4 shrink-0 text-muted-foreground/50 transition-transform group-hover:-translate-x-1 group-hover:text-primary" />
          </Link>
        ))}
      </div>
    </section>
  );
}

const trackStatuses: { key: TrackStatus; label: string; color: string; text: string }[] = [
  { key: 'PUBLISHED', label: 'منتشرشده', color: 'bg-emerald-400', text: 'text-emerald-300' },
  { key: 'PROCESSING', label: 'در حال پردازش', color: 'bg-sky-400', text: 'text-sky-300' },
  { key: 'DRAFT', label: 'پیش‌نویس', color: 'bg-slate-400', text: 'text-slate-300' },
  { key: 'REJECTED', label: 'ردشده', color: 'bg-rose-400', text: 'text-rose-300' },
  { key: 'ARCHIVED', label: 'بایگانی‌شده', color: 'bg-amber-400', text: 'text-amber-300' },
];

function RecentTrackStatus({
  tracks,
  loading,
}: {
  tracks: { status: TrackStatus }[];
  loading: boolean;
}) {
  const total = tracks.length;

  return (
    <Card className="h-full overflow-hidden rounded-2xl">
      <CardHeader className="border-b-0 pb-0">
        <div>
          <CardTitle>وضعیت انتشار آهنگ‌ها</CardTitle>
          <p className="mt-1 text-xs text-muted-foreground">بر پایهٔ ۵ آهنگ اخیر دریافت‌شده از API</p>
        </div>
        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Activity className="h-4 w-4" />
        </span>
      </CardHeader>
      <CardBody className="pt-4">
        {loading ? (
          <div className="space-y-4">
            {Array.from({ length: 4 }).map((_, index) => <Skeleton key={index} className="h-8 w-full" />)}
          </div>
        ) : total === 0 ? (
          <EmptyState title="هنوز آهنگی ثبت نشده است" description="با بارگذاری اولین آهنگ، وضعیت انتشار در این بخش نمایش داده می‌شود." className="py-8" />
        ) : (
          <>
            <div className="mb-5 flex h-3 overflow-hidden rounded-full bg-secondary" aria-label="نمودار وضعیت آهنگ‌های اخیر">
              {trackStatuses.map((status) => {
                const count = tracks.filter((track) => track.status === status.key).length;
                return count > 0 ? (
                  <span
                    key={status.key}
                    className={cn('h-full transition-all', status.color)}
                    style={{ width: \`\${(count / total) * 100}%\` }}
                    title={\`\${status.label}: \${formatFaNumber(count)}\`}
                  />
                ) : null;
              })}
            </div>
            <div className="space-y-4">
              {trackStatuses.map((status) => {
                const count = tracks.filter((track) => track.status === status.key).length;
                const percent = total ? Math.round((count / total) * 100) : 0;
                return (
                  <div key={status.key}>
                    <div className="mb-1.5 flex items-center justify-between gap-3 text-xs">
                      <span className="flex items-center gap-2 text-muted-foreground">
                        <span className={cn('h-2 w-2 rounded-full', status.color)} />
                        {status.label}
                      </span>
                      <span className={cn('font-semibold tabular-nums', status.text)}>{formatFaNumber(count)} <span className="font-normal text-muted-foreground">({formatFaNumber(percent)}٪)</span></span>
                    </div>
                    <div className="h-1.5 overflow-hidden rounded-full bg-secondary">
                      <div className={cn('h-full rounded-full transition-all duration-500', status.color)} style={{ width: \`\${percent}%\` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </CardBody>
    </Card>
  );
}

export default function AdminDashboardPage() {
  const {
    data: stats,
    isLoading: statsLoading,
    isFetching: statsFetching,
    refetch: refetchStats,
  } = useAdminDashboard();
  const {
    data: recentUsers,
    isLoading: usersLoading,
    isFetching: usersFetching,
    refetch: refetchUsers,
  } = useAdminUsers({ page: 1, limit: 5 });
  const {
    data: recentTracks,
    isLoading: tracksLoading,
    isFetching: tracksFetching,
    refetch: refetchTracks,
  } = useTracks({ page: 1, limit: 5 });

  const refreshing = statsFetching || usersFetching || tracksFetching;
  const tracks = recentTracks?.items ?? [];

  const metrics: {
    label: string;
    value: number;
    description: string;
    icon: LucideIcon;
    tone: Tone;
  }[] = [
    { label: 'کاربران ثبت‌نام‌شده', value: stats?.totalUsers ?? 0, description: 'کل حساب‌های ثبت‌شده', icon: Users, tone: 'blue' },
    { label: 'هنرمندان', value: stats?.totalArtists ?? 0, description: 'پروفایل‌های هنرمندی', icon: Mic2, tone: 'violet' },
    { label: 'آهنگ‌ها', value: stats?.totalTracks ?? 0, description: 'کل آهنگ‌های ثبت‌شده', icon: AudioLines, tone: 'green' },
    { label: 'آلبوم‌ها', value: stats?.totalAlbums ?? 0, description: 'مجموعه‌های موسیقی', icon: Disc3, tone: 'amber' },
    { label: 'اشتراک‌های فعال', value: stats?.activeSubscriptions ?? 0, description: 'اشتراک‌های در حال اعتبار', icon: Sparkles, tone: 'rose' },
  ];

  return (
    <div className="space-y-6 sm:space-y-7">
      <PageHeader
        title="داشبورد مدیریت"
        description="تصویری سریع و به‌روز از وضعیت پلتفرم موسیقی Soundwave."
        action={
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => { void Promise.all([refetchStats(), refetchUsers(), refetchTracks()]); }}
              disabled={refreshing}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-border bg-card px-3 text-xs font-medium text-foreground transition-colors hover:border-primary/40 hover:bg-secondary disabled:cursor-not-allowed disabled:opacity-60 sm:px-4 sm:text-sm"
            >
              <RefreshCw className={cn('h-4 w-4', refreshing && 'animate-spin')} />
              بروزرسانی
            </button>
            <Link
              href={ROUTES.BROWSE}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-primary px-3 text-xs font-semibold text-primary-foreground transition-opacity hover:opacity-90 sm:px-4 sm:text-sm"
            >
              <ExternalLink className="h-4 w-4" />
              مشاهده سایت
            </Link>
          </div>
        }
      />

      <DashboardWelcome />

      <section>
        <div className="mb-3 flex flex-wrap items-end justify-between gap-2">
          <div>
            <h2 className="text-sm font-bold text-foreground sm:text-base">شاخص‌های کلیدی</h2>
            <p className="mt-1 text-xs text-muted-foreground">آمار کلی دریافتی از سرویس مدیریت</p>
          </div>
          {statsFetching && <span className="text-xs text-primary">در حال همگام‌سازی…</span>}
        </div>
        <div className="grid grid-cols-1 gap-3 min-[420px]:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-5">
          {metrics.map((metric) => (
            <MetricCard key={metric.label} {...metric} loading={statsLoading} />
          ))}
        </div>
      </section>

      <QuickActions />

      <section>
        <div className="mb-3">
          <h2 className="text-sm font-bold text-foreground sm:text-base">تحلیل و وضعیت پلتفرم</h2>
          <p className="mt-1 text-xs text-muted-foreground">نمایش داده‌های واقعی دریافت‌شده از API؛ بدون مقادیر نمونه یا تخمینی.</p>
        </div>
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">
          <Card className="overflow-hidden rounded-2xl xl:col-span-5">
            <CardHeader>
              <div>
                <CardTitle>ترکیب محتوای موسیقی</CardTitle>
                <p className="mt-1 text-xs text-muted-foreground">مقایسه تعداد هنرمندان، آلبوم‌ها و آهنگ‌ها</p>
              </div>
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-violet-500/10 text-violet-300">
                <Layers3 className="h-4 w-4" />
              </span>
            </CardHeader>
            <CardBody className="flex min-h-[230px] items-center justify-center">
              {statsLoading ? (
                <Skeleton className="h-40 w-40 rounded-full" />
              ) : (
                <DonutChart
                  segments={[
                    { label: 'هنرمندان', value: stats?.totalArtists ?? 0, colorVar: 'hsl(263 75% 66%)' },
                    { label: 'آلبوم‌ها', value: stats?.totalAlbums ?? 0, colorVar: 'hsl(38 92% 55%)' },
                    { label: 'آهنگ‌ها', value: stats?.totalTracks ?? 0, colorVar: 'hsl(160 60% 45%)' },
                  ]}
                />
              )}
            </CardBody>
          </Card>

          <Card className="overflow-hidden rounded-2xl xl:col-span-4">
            <CardHeader>
              <div>
                <CardTitle>اشتراک‌های فعال</CardTitle>
                <p className="mt-1 text-xs text-muted-foreground">سهم اشتراک‌های فعال از مجموع حساب‌ها</p>
              </div>
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-500/10 text-amber-300">
                <Sparkles className="h-4 w-4" />
              </span>
            </CardHeader>
            <CardBody className="flex min-h-[230px] flex-col justify-center gap-5">
              {statsLoading ? (
                <>
                  <Skeleton className="h-7 w-1/2" />
                  <Skeleton className="h-3 w-full rounded-full" />
                  <Skeleton className="h-12 w-full" />
                </>
              ) : (
                <>
                  <div className="flex items-end justify-between gap-3">
                    <div>
                      <p className="text-xs text-muted-foreground">اشتراک فعال</p>
                      <p className="mt-1 text-3xl font-bold text-foreground" dir="ltr">{formatFaNumber(stats?.activeSubscriptions ?? 0)}</p>
                    </div>
                    <div className="text-left">
                      <p className="text-xs text-muted-foreground">کل کاربران</p>
                      <p className="mt-1 text-lg font-semibold text-foreground" dir="ltr">{formatFaNumber(stats?.totalUsers ?? 0)}</p>
                    </div>
                  </div>
                  <RatioBar
                    label="درصد نسبت به کاربران"
                    numerator={stats?.activeSubscriptions ?? 0}
                    denominator={stats?.totalUsers ?? 0}
                    colorVar="hsl(263 75% 66%)"
                  />
                  <div className="flex items-start gap-2 rounded-xl border border-border bg-background/50 p-3">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
                    <p className="text-xs leading-5 text-muted-foreground">
                      این شاخص نسبت تعداد اشتراک‌های فعال به کل کاربران را نشان می‌دهد؛ ممکن است تعداد اشتراک‌ها با تعداد کاربران یکتا برابر نباشد.
                    </p>
                  </div>
                </>
              )}
            </CardBody>
          </Card>

          <div className="xl:col-span-3">
            <RecentTrackStatus tracks={tracks} loading={tracksLoading} />
          </div>
        </div>
      </section>

      <section>
        <div className="mb-3">
          <h2 className="text-sm font-bold text-foreground sm:text-base">آخرین فعالیت‌ها</h2>
          <p className="mt-1 text-xs text-muted-foreground">آخرین کاربران ثبت‌نام‌شده و آهنگ‌های ثبت‌شده در سیستم</p>
        </div>
        <div className="grid grid-cols-1 gap-4 2xl:grid-cols-2">
          <Card className="min-w-0 overflow-hidden rounded-2xl">
            <CardHeader>
              <div className="flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-sky-500/10 text-sky-300">
                  <UserRoundIcon />
                </span>
                <div>
                  <CardTitle>کاربران اخیر</CardTitle>
                  <p className="mt-1 text-xs text-muted-foreground">آخرین ۵ حساب ثبت‌شده</p>
                </div>
              </div>
              <Link href={ROUTES.ADMIN_USERS} className="inline-flex shrink-0 items-center gap-1 text-xs font-medium text-primary hover:underline">
                مشاهده همه <ArrowLeft className="h-3.5 w-3.5" />
              </Link>
            </CardHeader>
            {usersLoading ? (
              <CardBody className="space-y-3">
                {Array.from({ length: 4 }).map((_, index) => <Skeleton key={index} className="h-12 w-full" />)}
              </CardBody>
            ) : !recentUsers?.items.length ? (
              <EmptyState title="کاربری یافت نشد" description="پس از ثبت‌نام کاربران، اطلاعات آن‌ها در این بخش دیده می‌شود." />
            ) : (
              <Table>
                <THead>
                  <tr><Th>حساب کاربری</Th><Th>نقش</Th><Th>تاریخ عضویت</Th></tr>
                </THead>
                <TBody>
                  {recentUsers.items.map((user) => (
                    <Tr key={user.id}>
                      <Td>
                        <div className="flex min-w-[150px] items-center gap-3">
                          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-secondary text-xs font-bold text-foreground">
                            {(user.firstName?.[0] || user.username?.[0] || '؟').toLocaleUpperCase('fa-IR')}
                          </span>
                          <div className="min-w-0">
                            <p className="max-w-[180px] truncate font-medium">{user.firstName ? \`\${user.firstName} \${user.lastName ?? ''}\`.trim() : user.username}</p>
                            <p className="max-w-[180px] truncate text-xs text-muted-foreground" dir="ltr">{user.email}</p>
                          </div>
                        </div>
                      </Td>
                      <Td><RoleBadge role={user.role} /></Td>
                      <Td className="text-muted-foreground">{formatJalaliShort(user.createdAt)}</Td>
                    </Tr>
                  ))}
                </TBody>
              </Table>
            )}
          </Card>

          <Card className="min-w-0 overflow-hidden rounded-2xl">
            <CardHeader>
              <div className="flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-300">
                  <Music2 className="h-4 w-4" />
                </span>
                <div>
                  <CardTitle>آهنگ‌های اخیر</CardTitle>
                  <p className="mt-1 text-xs text-muted-foreground">آخرین ۵ آهنگ دریافت‌شده از API</p>
                </div>
              </div>
              <Link href={ROUTES.ADMIN_TRACKS} className="inline-flex shrink-0 items-center gap-1 text-xs font-medium text-primary hover:underline">
                مشاهده همه <ArrowLeft className="h-3.5 w-3.5" />
              </Link>
            </CardHeader>
            {tracksLoading ? (
              <CardBody className="space-y-3">
                {Array.from({ length: 4 }).map((_, index) => <Skeleton key={index} className="h-12 w-full" />)}
              </CardBody>
            ) : !tracks.length ? (
              <EmptyState title="آهنگی یافت نشد" description="آهنگ‌های ثبت‌شده پس از دریافت از API در این بخش نمایش داده می‌شوند." />
            ) : (
              <Table>
                <THead>
                  <tr><Th>عنوان آهنگ</Th><Th>هنرمند</Th><Th>وضعیت</Th></tr>
                </THead>
                <TBody>
                  {tracks.map((track) => (
                    <Tr key={track.id}>
                      <Td className="max-w-[220px] truncate font-medium">{track.title}</Td>
                      <Td className="max-w-[180px] truncate text-muted-foreground">{track.artist.stageName}</Td>
                      <Td><TrackStatusBadge status={track.status} /></Td>
                    </Tr>
                  ))}
                </TBody>
              </Table>
            )}
          </Card>
        </div>
      </section>

      <footer className="flex flex-col gap-2 rounded-xl border border-border/70 bg-card/50 px-4 py-3 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
        <span className="inline-flex items-center gap-2"><Clock3 className="h-3.5 w-3.5" /> تاریخ نمایش بر اساس تقویم شمسی است.</span>
        <span className="inline-flex items-center gap-2"><Activity className="h-3.5 w-3.5" /> اعداد داشبورد از سرویس‌های موجود پروژه دریافت می‌شوند.</span>
      </footer>
    </div>
  );
}

function UserRoundIcon() {
  return <Users className="h-4 w-4" />;
}
