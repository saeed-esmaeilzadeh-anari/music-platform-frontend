'use client';

import { useMemo, useState } from 'react';
import { Search, MoreVertical, Ban, CheckCircle2, Trash2, BadgeCheck, MailWarning } from 'lucide-react';
import { PageHeader } from '@/components/admin/page-header';
import { Card } from '@/components/admin/card';
import { Table, TBody, Td, Th, THead, Tr } from '@/components/admin/table';
import { PaginationBar } from '@/components/admin/pagination-bar';
import { EmptyState } from '@/components/admin/empty-state';
import { ConfirmDialog } from '@/components/admin/confirm-dialog';
import { RoleBadge } from '@/components/admin/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAdminUsers, useDeleteUser, useUpdateUserStatus } from '@/hooks/use-admin';
import { formatJalaliShort, formatFaNumber } from '@/lib/utils/format-fa';
import { FA_ROLE_LABELS } from '@/lib/constants/admin';
import { DEFAULT_PAGE_SIZE } from '@/lib/constants';
import type { Role, UserResponse } from '@/types';

type RoleFilter = 'ALL' | Role;

export default function AdminUsersPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<RoleFilter>('ALL');
  const [statusTarget, setStatusTarget] = useState<{ user: UserResponse; suspend: boolean } | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<UserResponse | null>(null);

  const { data, isLoading } = useAdminUsers({ page, limit: DEFAULT_PAGE_SIZE });
  const updateStatus = useUpdateUserStatus();
  const deleteUser = useDeleteUser();

  const filteredItems = useMemo(() => {
    if (!data?.items) return [];
    return data.items.filter((u) => {
      const matchesRole = roleFilter === 'ALL' || u.role === roleFilter;
      const q = search.trim().toLowerCase();
      const matchesSearch =
        !q || u.username.toLowerCase().includes(q) || u.email.toLowerCase().includes(q);
      return matchesRole && matchesSearch;
    });
  }, [data?.items, roleFilter, search]);

  return (
    <div>
      <PageHeader
        title="کاربران"
        description={
          data ? `${formatFaNumber(data.meta.totalItems)} کاربر ثبت‌شده در پلتفرم` : 'مدیریت کاربران پلتفرم'
        }
      />

      <Card>
        <div className="flex flex-wrap items-center gap-3 border-b border-border px-5 py-4">
          <div className="relative min-w-[220px] flex-1">
            <Search className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="جستجو در همین صفحه (نام کاربری یا ایمیل)…"
              className="h-10 w-full rounded-md border border-border bg-input ps-9 pe-3 text-sm text-foreground outline-none placeholder:text-muted-foreground/60 focus:ring-2 focus:ring-ring focus:ring-offset-1 focus:ring-offset-background"
            />
          </div>

          <Select value={roleFilter} onValueChange={(v) => setRoleFilter(v as RoleFilter)}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="همهٔ نقش‌ها" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">همهٔ نقش‌ها</SelectItem>
              {(Object.keys(FA_ROLE_LABELS) as Role[]).map((r) => (
                <SelectItem key={r} value={r}>
                  {FA_ROLE_LABELS[r]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {isLoading ? (
          <div className="space-y-3 p-5">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : !filteredItems.length ? (
          <EmptyState
            title="کاربری یافت نشد"
            description={search || roleFilter !== 'ALL' ? 'فیلتر یا عبارت جستجو را تغییر دهید.' : undefined}
          />
        ) : (
          <Table>
            <THead>
              <tr>
                <Th>کاربر</Th>
                <Th>نقش</Th>
                <Th>ایمیل</Th>
                <Th>تاریخ عضویت</Th>
                <Th className="text-end">عملیات</Th>
              </tr>
            </THead>
            <TBody>
              {filteredItems.map((u) => (
                <Tr key={u.id}>
                  <Td>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback>{u.username.slice(0, 2).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <p className="font-medium">{u.username}</p>
                    </div>
                  </Td>
                  <Td>
                    <RoleBadge role={u.role} />
                  </Td>
                  <Td>
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      {u.email}
                      {u.isEmailVerified ? (
                        <BadgeCheck className="h-3.5 w-3.5 text-emerald-400" aria-label="ایمیل تأییدشده" />
                      ) : (
                        <MailWarning className="h-3.5 w-3.5 text-amber-400" aria-label="ایمیل تأییدنشده" />
                      )}
                    </div>
                  </Td>
                  <Td className="text-muted-foreground">{formatJalaliShort(u.createdAt)}</Td>
                  <Td className="text-end">
                    <DropdownMenu>
                      <DropdownMenuTrigger className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground">
                        <MoreVertical className="h-4 w-4" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => setStatusTarget({ user: u, suspend: false })}
                          className="flex items-center gap-2.5"
                        >
                          <CheckCircle2 className="h-4 w-4" />
                          فعال‌سازی حساب
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => setStatusTarget({ user: u, suspend: true })}
                          className="flex items-center gap-2.5"
                        >
                          <Ban className="h-4 w-4" />
                          تعلیق حساب
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          destructive
                          onClick={() => setDeleteTarget(u)}
                          className="flex items-center gap-2.5"
                        >
                          <Trash2 className="h-4 w-4" />
                          حذف کاربر
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </Td>
                </Tr>
              ))}
            </TBody>
          </Table>
        )}

        {data && <PaginationBar meta={data.meta} onPageChange={setPage} />}
      </Card>

      <ConfirmDialog
        open={!!statusTarget}
        onOpenChange={(o) => !o && setStatusTarget(null)}
        title={statusTarget?.suspend ? 'تعلیق حساب کاربر' : 'فعال‌سازی حساب کاربر'}
        description={
          statusTarget?.suspend
            ? `آیا از تعلیق حساب «${statusTarget?.user.username}» مطمئن هستید؟ این کاربر تا زمان فعال‌سازی مجدد قادر به ورود نخواهد بود.`
            : `حساب «${statusTarget?.user.username}» فعال خواهد شد.`
        }
        confirmLabel={statusTarget?.suspend ? 'تعلیق کاربر' : 'فعال‌سازی'}
        destructive={!!statusTarget?.suspend}
        loading={updateStatus.isPending}
        onConfirm={() => {
          if (!statusTarget) return;
          updateStatus.mutate(
            { id: statusTarget.user.id, dto: { status: statusTarget.suspend ? 'SUSPENDED' : 'ACTIVE' } },
            { onSuccess: () => setStatusTarget(null) },
          );
        }}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(o) => !o && setDeleteTarget(null)}
        title="حذف کاربر"
        description={`آیا از حذف کامل «${deleteTarget?.username}» مطمئن هستید؟ این عملیات غیرقابل بازگشت است.`}
        confirmLabel="حذف کاربر"
        loading={deleteUser.isPending}
        onConfirm={() => {
          if (!deleteTarget) return;
          deleteUser.mutate(deleteTarget.id, { onSuccess: () => setDeleteTarget(null) });
        }}
      />
    </div>
  );
}
