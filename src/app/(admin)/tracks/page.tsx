'use client';

import { useEffect, useMemo, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Search, Pencil, Trash2, AudioLines, ShieldAlert } from 'lucide-react';
import { PageHeader } from '@/components/admin/page-header';
import { Card } from '@/components/admin/card';
import { Table, TBody, Td, Th, THead, Tr } from '@/components/admin/table';
import { PaginationBar } from '@/components/admin/pagination-bar';
import { EmptyState } from '@/components/admin/empty-state';
import { ConfirmDialog } from '@/components/admin/confirm-dialog';
import { TrackStatusBadge, Badge } from '@/components/admin/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Checkbox } from '@/components/ui/checkbox';
import { FormField, FormInput } from '@/components/ui/form-field';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { useTracks, useUpdateTrack, useDeleteTrack } from '@/hooks/use-tracks';
import { useArtists } from '@/hooks/use-artists';
import { useAlbums } from '@/hooks/use-albums';
import { useGenres } from '@/hooks/use-catalog';
import { FA_TRACK_STATUS_LABELS } from '@/lib/constants/admin';
import { DEFAULT_PAGE_SIZE } from '@/lib/constants';
import { formatFaCompact, formatFaDuration, formatFaNumber } from '@/lib/utils/format-fa';
import type { TrackResponse, TrackStatus } from '@/types';

const trackSchema = z.object({
  title: z.string().min(1, 'عنوان الزامی است').max(150, 'عنوان بیش از حد طولانی است'),
  albumId: z.string().optional(),
  isExplicit: z.boolean(),
  genreIds: z.array(z.string()).optional(),
});
type TrackFormValues = z.infer<typeof trackSchema>;

function TrackFormDialog({ track, onClose }: { track: TrackResponse; onClose: () => void }) {
  const updateTrack = useUpdateTrack(track.artist.id);
  const { data: albumsData } = useAlbums({ artistId: track.artist.id, limit: 100 });
  const { data: genres } = useGenres();

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<TrackFormValues>({
    resolver: zodResolver(trackSchema),
    defaultValues: {
      title: track.title,
      albumId: track.albumId ?? '',
      isExplicit: track.isExplicit,
      genreIds: [],
    },
  });

  const onSubmit = (values: TrackFormValues) => {
    updateTrack.mutate(
      {
        trackId: track.id,
        dto: {
          title: values.title,
          albumId: values.albumId || undefined,
          isExplicit: values.isExplicit,
          genreIds: values.genreIds?.length ? values.genreIds : undefined,
        },
      },
      { onSuccess: onClose },
    );
  };

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>ویرایش آهنگ</DialogTitle>
          <DialogDescription>
            ویرایش «{track.title}» از {track.artist.stageName}.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <FormField label="عنوان" required error={errors.title?.message}>
            <FormInput error={!!errors.title} {...register('title')} />
          </FormField>

          <FormField label="آلبوم" hint="اختیاری — بدون آلبوم = تک‌آهنگ مستقل">
            <Controller
              control={control}
              name="albumId"
              render={({ field }) => (
                <Select value={field.value || 'NONE'} onValueChange={(v) => field.onChange(v === 'NONE' ? '' : v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="بدون آلبوم" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="NONE">بدون آلبوم</SelectItem>
                    {albumsData?.items.map((al) => (
                      <SelectItem key={al.id} value={al.id}>
                        {al.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </FormField>

          {!!genres?.length && (
            <FormField
              label="ژانرها"
              hint="اختیاری — فهرست فعلی ژانرها در پاسخ سرور موجود نیست؛ اگر موردی را انتخاب کنید، جایگزین ژانرهای پیشین خواهد شد."
            >
              <Controller
                control={control}
                name="genreIds"
                render={({ field }) => (
                  <div className="flex flex-wrap gap-2">
                    {genres.map((g) => {
                      const checked = field.value?.includes(g.id);
                      return (
                        <button
                          type="button"
                          key={g.id}
                          onClick={() =>
                            field.onChange(
                              checked
                                ? field.value?.filter((id) => id !== g.id)
                                : [...(field.value ?? []), g.id],
                            )
                          }
                          className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                            checked
                              ? 'border-primary bg-primary/15 text-primary'
                              : 'border-border text-muted-foreground hover:bg-secondary'
                          }`}
                        >
                          {g.name}
                        </button>
                      );
                    })}
                  </div>
                )}
              />
            </FormField>
          )}

          <Controller
            control={control}
            name="isExplicit"
            render={({ field }) => (
              <Checkbox
                checked={field.value}
                onChange={(e) => field.onChange(e.target.checked)}
                label="دارای محتوای صریح (Explicit)"
              />
            )}
          />

          <DialogFooter>
            <Button type="button" variant="secondary" onClick={onClose} disabled={updateTrack.isPending}>
              انصراف
            </Button>
            <Button type="submit" loading={updateTrack.isPending}>
              ذخیرهٔ تغییرات
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default function AdminTracksPage() {
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | TrackStatus>('ALL');
  const [artistFilter, setArtistFilter] = useState<string>('ALL');
  const [editingTrack, setEditingTrack] = useState<TrackResponse | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<TrackResponse | null>(null);

  // Debounce the free-text search so we don't fire a request per keystroke
  useEffect(() => {
    const t = setTimeout(() => {
      setSearch(searchInput.trim());
      setPage(1);
    }, 400);
    return () => clearTimeout(t);
  }, [searchInput]);

  const { data: artistsData } = useArtists({ page: 1, limit: 100 });
  const { data: albumsData } = useAlbums({ page: 1, limit: 100 });
  const albumMap = useMemo(() => {
    const map = new Map<string, string>();
    albumsData?.items.forEach((a) => map.set(a.id, a.title));
    return map;
  }, [albumsData]);

  const { data, isLoading } = useTracks({
    page,
    limit: DEFAULT_PAGE_SIZE,
    search: search || undefined,
    status: statusFilter === 'ALL' ? undefined : statusFilter,
    artistId: artistFilter === 'ALL' ? undefined : artistFilter,
  });
  const deleteTrack = useDeleteTrack(deleteTarget?.artist.id ?? '');

  return (
    <div>
      <PageHeader
        title="آهنگ‌ها"
        description={data ? `${formatFaNumber(data.meta.totalItems)} آهنگ در پلتفرم` : 'مدیریت آهنگ‌های پلتفرم'}
      />

      <Card>
        <div className="flex flex-wrap items-center gap-3 border-b border-border px-5 py-4">
          <div className="relative min-w-[220px] flex-1">
            <Search className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="جستجوی عنوان آهنگ…"
              className="h-10 w-full rounded-md border border-border bg-input ps-9 pe-3 text-sm text-foreground outline-none placeholder:text-muted-foreground/60 focus:ring-2 focus:ring-ring focus:ring-offset-1 focus:ring-offset-background"
            />
          </div>

          <Select
            value={statusFilter}
            onValueChange={(v) => {
              setStatusFilter(v as 'ALL' | TrackStatus);
              setPage(1);
            }}
          >
            <SelectTrigger className="w-44">
              <SelectValue placeholder="همهٔ وضعیت‌ها" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">همهٔ وضعیت‌ها</SelectItem>
              {(Object.keys(FA_TRACK_STATUS_LABELS) as TrackStatus[]).map((s) => (
                <SelectItem key={s} value={s}>
                  {FA_TRACK_STATUS_LABELS[s]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={artistFilter}
            onValueChange={(v) => {
              setArtistFilter(v);
              setPage(1);
            }}
          >
            <SelectTrigger className="w-52">
              <SelectValue placeholder="همهٔ هنرمندان" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">همهٔ هنرمندان</SelectItem>
              {artistsData?.items.map((a) => (
                <SelectItem key={a.id} value={a.id}>
                  {a.stageName}
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
        ) : !data?.items.length ? (
          <EmptyState
            icon={AudioLines}
            title="آهنگی یافت نشد"
            description={search || statusFilter !== 'ALL' || artistFilter !== 'ALL' ? 'فیلترها را تغییر دهید.' : undefined}
          />
        ) : (
          <Table>
            <THead>
              <tr>
                <Th>عنوان</Th>
                <Th>هنرمند</Th>
                <Th>آلبوم</Th>
                <Th>مدت</Th>
                <Th>پخش‌شده</Th>
                <Th>وضعیت</Th>
                <Th className="text-end">عملیات</Th>
              </tr>
            </THead>
            <TBody>
              {data.items.map((t) => (
                <Tr key={t.id}>
                  <Td>
                    <div className="flex items-center gap-2 font-medium">
                      {t.title}
                      {t.isExplicit && (
                        <Badge tone="neutral" className="gap-1 px-1.5">
                          <ShieldAlert className="h-3 w-3" />
                          صریح
                        </Badge>
                      )}
                    </div>
                  </Td>
                  <Td className="text-muted-foreground">{t.artist.stageName}</Td>
                  <Td className="text-muted-foreground">{t.albumId ? albumMap.get(t.albumId) ?? '—' : 'تک‌آهنگ'}</Td>
                  <Td className="text-muted-foreground" dir="ltr">
                    {formatFaDuration(t.durationSec)}
                  </Td>
                  <Td className="text-muted-foreground">{formatFaCompact(Number(t.playCount))}</Td>
                  <Td>
                    <TrackStatusBadge status={t.status} />
                  </Td>
                  <Td className="text-end">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        type="button"
                        onClick={() => setEditingTrack(t)}
                        className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                        aria-label="ویرایش"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleteTarget(t)}
                        className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                        aria-label="حذف"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </Td>
                </Tr>
              ))}
            </TBody>
          </Table>
        )}

        {data && <PaginationBar meta={data.meta} onPageChange={setPage} />}
      </Card>

      {editingTrack && <TrackFormDialog track={editingTrack} onClose={() => setEditingTrack(null)} />}

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(o) => !o && setDeleteTarget(null)}
        title="حذف آهنگ"
        description={`آیا از حذف آهنگ «${deleteTarget?.title}» مطمئن هستید؟ این عملیات غیرقابل بازگشت است.`}
        confirmLabel="حذف آهنگ"
        loading={deleteTrack.isPending}
        onConfirm={() => {
          if (!deleteTarget) return;
          deleteTrack.mutate(deleteTarget.id, { onSuccess: () => setDeleteTarget(null) });
        }}
      />
    </div>
  );
}
