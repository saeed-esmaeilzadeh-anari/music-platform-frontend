'use client';

import Link from 'next/link';
import { Users, Mic2, AudioLines, Disc3, Sparkles, ArrowLeft } from 'lucide-react';
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
import { ROUTES } from '@/lib/constants';
import { formatJalaliShort } from '@/lib/utils/format-fa';

export default function AdminDashboardPage() {
  const { data: stats, isLoading: statsLoading } = useAdminDashboard();
  const { data: recentUsers, isLoading: usersLoading } = useAdminUsers({ page: 1, limit: 5 });
  const { data: recentTracks, isLoading: tracksLoading } = useTracks({ page: 1, limit: 5 });

  return (
    <div>
      <PageHeader
        title="داشبورد مدیریت"
        description="نمای کلی از وضعیت کاربران، هنرمندان و محتوای پلتفرم Soundwave."
      />

      {/* KPI row */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <StatCard label="کاربران" value={stats?.totalUsers ?? 0} icon={Users} tone="primary" loading={statsLoading} />
        <StatCard label="هنرمندان" value={stats?.totalArtists ?? 0} icon={Mic2} tone="info" loading={statsLoading} />
        <StatCard label="آهنگ‌ها" value={stats?.totalTracks ?? 0} icon={AudioLines} tone="success" loading={statsLoading} />
        <StatCard label="آلبوم‌ها" value={stats?.totalAlbums ?? 0} icon={Disc3} tone="warning" loading={statsLoading} />
        <StatCard
          label="اشتراک‌های فعال"
          value={stats?.activeSubscriptions ?? 0}
          icon={Sparkles}
          tone="danger"
          loading={statsLoading}
        />
      </div>

      {/* Composition + ratio */}
      <div className="mt-6 grid grid-cols-1 gap-5 lg:grid-cols-5">
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
                  { label: 'آلبوم‌ها', value: stats?.totalAlbums ?? 0, colorVar: 'hsl(var(--accent))' },
                  { label: 'آهنگ‌ها', value: stats?.totalTracks ?? 0, colorVar: 'hsl(38 92% 50%)' },
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
              این نسبت، سهم کاربرانی را نشان می‌دهد که در حال حاضر اشتراک فعال دارند و می‌تواند شاخصی برای
              نرخ تبدیل کاربران رایگان به مشترک باشد.
            </p>
          </CardBody>
        </Card>
      </div>

      {/* Recent lists */}
      <div className="mt-6 grid grid-cols-1 gap-5 xl:grid-cols-2">
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
