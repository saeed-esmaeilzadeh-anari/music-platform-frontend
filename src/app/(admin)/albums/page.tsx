'use client';

import { useMemo, useState } from 'react';
import Image from 'next/image';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Pencil, Trash2, Disc3 } from 'lucide-react';
import { PageHeader } from '@/components/admin/page-header';
import { Card } from '@/components/admin/card';
import { Table, TBody, Td, Th, THead, Tr } from '@/components/admin/table';
import { PaginationBar } from '@/components/admin/pagination-bar';
import { EmptyState } from '@/components/admin/empty-state';
import { ConfirmDialog } from '@/components/admin/confirm-dialog';
import { PublishedBadge } from '@/components/admin/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
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
import { useAlbums, useDeleteAlbum, useUpdateAlbum } from '@/hooks/use-albums';
import { useArtists } from '@/hooks/use-artists';
import { useGenres } from '@/hooks/use-catalog';
import { FA_ALBUM_TYPE_LABELS } from '@/lib/constants/admin';
import { DEFAULT_PAGE_SIZE } from '@/lib/constants';
import { formatFaNumber, formatJalaliShort } from '@/lib/utils/format-fa';
import type { AlbumResponse, AlbumType } from '@/types';

const albumSchema = z.object({
  title: z.string().min(1, 'عنوان الزامی است').max(120, 'عنوان بیش از حد طولانی است'),
  type: z.enum(['ALBUM', 'SINGLE', 'EP', 'COMPILATION']),
  releaseDate: z.string().optional(),
  genreIds: z.array(z.string()).optional(),
});
type AlbumFormValues = z.infer<typeof albumSchema>;

function AlbumFormDialog({
  album,
  onClose,
}: {
  album: AlbumResponse;
  onClose: () => void;
}) {
  const updateAlbum = useUpdateAlbum(album.id);
  const { data: genres } = useGenres();

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<AlbumFormValues>({
    resolver: zodResolver(albumSchema),
    defaultValues: {
      title: album.title,
      type: album.type,
      releaseDate: album.releaseDate ? album.releaseDate.slice(0, 10) : '',
      genreIds: [],
    },
  });

  const onSubmit = (values: AlbumFormValues) => {
    updateAlbum.mutate(
      {
        title: values.title,
        type: values.type,
        releaseDate: values.releaseDate || undefined,
        genreIds: values.genreIds?.length ? values.genreIds : undefined,
      },
      { onSuccess: onClose },
    );
  };

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>ویرایش آلبوم</DialogTitle>
          <DialogDescription>ویرایش اطلاعات «{album.title}».</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <FormField label="عنوان" required error={errors.title?.message}>
            <FormInput error={!!errors.title} {...register('title')} />
          </FormField>

          <FormField label="نوع" error={errors.type?.message}>
            <Controller
              control={control}
              name="type"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {(Object.keys(FA_ALBUM_TYPE_LABELS) as AlbumType[]).map((t) => (
                      <SelectItem key={t} value={t}>
                        {FA_ALBUM_TYPE_LABELS[t]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </FormField>

          <FormField label="تاریخ انتشار" hint="اختیاری — بر اساس تقویم میلادی" error={errors.releaseDate?.message}>
            <FormInput type="date" {...register('releaseDate')} />
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

          <DialogFooter>
            <Button type="button" variant="secondary" onClick={onClose} disabled={updateAlbum.isPending}>
              انصراف
            </Button>
            <Button type="submit" loading={updateAlbum.isPending}>
              ذخیرهٔ تغییرات
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default function AdminAlbumsPage() {
  const [page, setPage] = useState(1);
  const [artistFilter, setArtistFilter] = useState<string>('ALL');
  const [editingAlbum, setEditingAlbum] = useState<AlbumResponse | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<AlbumResponse | null>(null);

  const { data: artistsData } = useArtists({ page: 1, limit: 100 });
  const artistMap = useMemo(() => {
    const map = new Map<string, string>();
    artistsData?.items.forEach((a) => map.set(a.id, a.stageName));
    return map;
  }, [artistsData]);

  const { data, isLoading } = useAlbums({
    page,
    limit: DEFAULT_PAGE_SIZE,
    artistId: artistFilter === 'ALL' ? undefined : artistFilter,
  });
  const deleteAlbum = useDeleteAlbum();

  return (
    <div>
      <PageHeader
        title="آلبوم‌ها"
        description={data ? `${formatFaNumber(data.meta.totalItems)} آلبوم منتشرشده در پلتفرم` : 'مدیریت آلبوم‌ها'}
      />

      <Card>
        <div className="flex flex-wrap items-center gap-3 border-b border-border px-5 py-4">
          <Select
            value={artistFilter}
            onValueChange={(v) => {
              setArtistFilter(v);
              setPage(1);
            }}
          >
            <SelectTrigger className="w-56">
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
          <EmptyState icon={Disc3} title="آلبومی یافت نشد" />
        ) : (
          <Table>
            <THead>
              <tr>
                <Th>آلبوم</Th>
                <Th>هنرمند</Th>
                <Th>نوع</Th>
                <Th>وضعیت</Th>
                <Th>تاریخ انتشار</Th>
                <Th className="text-end">عملیات</Th>
              </tr>
            </THead>
            <TBody>
              {data.items.map((al) => (
                <Tr key={al.id}>
                  <Td>
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-md bg-secondary">
                        {al.coverUrl ? (
                          <Image src={al.coverUrl} alt="" width={36} height={36} className="h-full w-full object-cover" />
                        ) : (
                          <Disc3 className="h-4 w-4 text-muted-foreground" />
                        )}
                      </div>
                      <p className="font-medium">{al.title}</p>
                    </div>
                  </Td>
                  <Td className="text-muted-foreground">{artistMap.get(al.artistId) ?? '—'}</Td>
                  <Td className="text-muted-foreground">{FA_ALBUM_TYPE_LABELS[al.type]}</Td>
                  <Td>
                    <PublishedBadge published={al.isPublished} />
                  </Td>
                  <Td className="text-muted-foreground">
                    {al.releaseDate ? formatJalaliShort(al.releaseDate) : '—'}
                  </Td>
                  <Td className="text-end">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        type="button"
                        onClick={() => setEditingAlbum(al)}
                        className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                        aria-label="ویرایش"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleteTarget(al)}
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

      {editingAlbum && <AlbumFormDialog album={editingAlbum} onClose={() => setEditingAlbum(null)} />}

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(o) => !o && setDeleteTarget(null)}
        title="حذف آلبوم"
        description={`آیا از حذف آلبوم «${deleteTarget?.title}» مطمئن هستید؟ این عملیات غیرقابل بازگشت است.`}
        confirmLabel="حذف آلبوم"
        loading={deleteAlbum.isPending}
        onConfirm={() => {
          if (!deleteTarget) return;
          deleteAlbum.mutate(deleteTarget.id, { onSuccess: () => setDeleteTarget(null) });
        }}
      />
    </div>
  );
}
