'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Pencil, Trash2, Tags } from 'lucide-react';
import { PageHeader } from '@/components/admin/page-header';
import { Card } from '@/components/admin/card';
import { Table, TBody, Td, Th, THead, Tr } from '@/components/admin/table';
import { EmptyState } from '@/components/admin/empty-state';
import { ConfirmDialog } from '@/components/admin/confirm-dialog';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Textarea } from '@/components/ui/textarea';
import { FormField, FormInput } from '@/components/ui/form-field';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { useCreateGenre, useDeleteGenre, useUpdateGenre } from '@/hooks/use-admin';
import { useGenres } from '@/hooks/use-catalog';
import type { GenreResponse } from '@/types';

const genreSchema = z.object({
  name: z.string().min(2, 'نام باید حداقل ۲ حرف باشد').max(50, 'نام بیش از حد طولانی است'),
  description: z.string().max(300, 'توضیحات بیش از حد طولانی است').optional(),
});
type GenreFormValues = z.infer<typeof genreSchema>;

function GenreFormDialog({
  open,
  onOpenChange,
  genre,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  genre: GenreResponse | null;
}) {
  const isEdit = !!genre;
  const createGenre = useCreateGenre();
  const updateGenre = useUpdateGenre();
  const pending = createGenre.isPending || updateGenre.isPending;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<GenreFormValues>({
    resolver: zodResolver(genreSchema),
    defaultValues: { name: '', description: '' },
  });

  useEffect(() => {
    if (open) reset({ name: genre?.name ?? '', description: genre?.description ?? '' });
  }, [open, genre, reset]);

  const onSubmit = (values: GenreFormValues) => {
    if (genre) {
      updateGenre.mutate(
        { id: genre.id, dto: values },
        { onSuccess: () => onOpenChange(false) },
      );
    } else {
      createGenre.mutate(values, { onSuccess: () => onOpenChange(false) });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? 'ویرایش ژانر' : 'ژانر جدید'}</DialogTitle>
          <DialogDescription>
            {isEdit ? 'اطلاعات ژانر را ویرایش کنید.' : 'یک ژانر موسیقی جدید برای دسته‌بندی محتوا اضافه کنید.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <FormField label="نام ژانر" required error={errors.name?.message}>
            <FormInput placeholder="مثلاً: پاپ" error={!!errors.name} {...register('name')} />
          </FormField>

          <FormField label="توضیحات" error={errors.description?.message} hint="اختیاری">
            <Textarea placeholder="توضیح کوتاهی دربارهٔ این ژانر…" error={!!errors.description} {...register('description')} />
          </FormField>

          <DialogFooter>
            <Button type="button" variant="secondary" onClick={() => onOpenChange(false)} disabled={pending}>
              انصراف
            </Button>
            <Button type="submit" loading={pending}>
              {isEdit ? 'ذخیرهٔ تغییرات' : 'ایجاد ژانر'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default function AdminGenresPage() {
  const { data: genres, isLoading } = useGenres();
  const deleteGenre = useDeleteGenre();

  const [formOpen, setFormOpen] = useState(false);
  const [editingGenre, setEditingGenre] = useState<GenreResponse | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<GenreResponse | null>(null);

  return (
    <div>
      <PageHeader
        title="ژانرها"
        description="دسته‌بندی‌های موسیقی مورد استفاده در آلبوم‌ها و آهنگ‌ها."
        action={
          <Button
            onClick={() => {
              setEditingGenre(null);
              setFormOpen(true);
            }}
          >
            <Plus className="h-4 w-4" />
            ژانر جدید
          </Button>
        }
      />

      <Card>
        {isLoading ? (
          <div className="space-y-3 p-5">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : !genres?.length ? (
          <EmptyState
            icon={Tags}
            title="هنوز ژانری ثبت نشده"
            description="اولین ژانر را برای دسته‌بندی محتوای پلتفرم ایجاد کنید."
            action={
              <Button size="sm" onClick={() => setFormOpen(true)}>
                <Plus className="h-4 w-4" />
                ژانر جدید
              </Button>
            }
          />
        ) : (
          <Table>
            <THead>
              <tr>
                <Th>نام</Th>
                <Th>نامک (Slug)</Th>
                <Th>توضیحات</Th>
                <Th className="text-end">عملیات</Th>
              </tr>
            </THead>
            <TBody>
              {genres.map((g) => (
                <Tr key={g.id}>
                  <Td className="font-medium">{g.name}</Td>
                  <Td className="font-mono text-xs text-muted-foreground" dir="ltr">
                    {g.slug}
                  </Td>
                  <Td className="max-w-xs truncate text-muted-foreground">{g.description || '—'}</Td>
                  <Td className="text-end">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        type="button"
                        onClick={() => {
                          setEditingGenre(g);
                          setFormOpen(true);
                        }}
                        className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                        aria-label="ویرایش"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleteTarget(g)}
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
      </Card>

      <GenreFormDialog open={formOpen} onOpenChange={setFormOpen} genre={editingGenre} />

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(o) => !o && setDeleteTarget(null)}
        title="حذف ژانر"
        description={`آیا از حذف ژانر «${deleteTarget?.name}» مطمئن هستید؟ این عملیات غیرقابل بازگشت است.`}
        confirmLabel="حذف ژانر"
        loading={deleteGenre.isPending}
        onConfirm={() => {
          if (!deleteTarget) return;
          deleteGenre.mutate(deleteTarget.id, { onSuccess: () => setDeleteTarget(null) });
        }}
      />
    </div>
  );
}
