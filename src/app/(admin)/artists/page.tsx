'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Pencil, Mic2 } from 'lucide-react';
import { PageHeader } from '@/components/admin/page-header';
import { Card } from '@/components/admin/card';
import { Table, TBody, Td, Th, THead, Tr } from '@/components/admin/table';
import { PaginationBar } from '@/components/admin/pagination-bar';
import { EmptyState } from '@/components/admin/empty-state';
import { VerifiedBadge } from '@/components/admin/badge';
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
import { useArtists, useUpdateArtist } from '@/hooks/use-artists';
import { formatFaCompact, formatFaNumber, formatJalaliShort } from '@/lib/utils/format-fa';
import { DEFAULT_PAGE_SIZE } from '@/lib/constants';
import type { ArtistResponse } from '@/types';

const artistSchema = z.object({
  stageName: z.string().min(1, 'نام مستعار الزامی است').max(60, 'نام بیش از حد طولانی است'),
  bio: z.string().max(500, 'بیوگرافی بیش از حد طولانی است').optional(),
});
type ArtistFormValues = z.infer<typeof artistSchema>;

function ArtistFormDialog({ artist, onClose }: { artist: ArtistResponse; onClose: () => void }) {
  const updateArtist = useUpdateArtist(artist.id);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ArtistFormValues>({
    resolver: zodResolver(artistSchema),
    defaultValues: { stageName: artist.stageName, bio: artist.bio ?? '' },
  });

  const onSubmit = (values: ArtistFormValues) => {
    updateArtist.mutate(values, { onSuccess: onClose });
  };

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>ویرایش هنرمند</DialogTitle>
          <DialogDescription>ویرایش نام مستعار و بیوگرافی «{artist.stageName}».</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <FormField label="نام مستعار" required error={errors.stageName?.message}>
            <FormInput error={!!errors.stageName} {...register('stageName')} />
          </FormField>

          <FormField label="بیوگرافی" error={errors.bio?.message} hint="اختیاری">
            <Textarea rows={4} error={!!errors.bio} {...register('bio')} />
          </FormField>

          <DialogFooter>
            <Button type="button" variant="secondary" onClick={onClose} disabled={updateArtist.isPending}>
              انصراف
            </Button>
            <Button type="submit" loading={updateArtist.isPending}>
              ذخیرهٔ تغییرات
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default function AdminArtistsPage() {
  const [page, setPage] = useState(1);
  const [editingArtist, setEditingArtist] = useState<ArtistResponse | null>(null);
  const { data, isLoading } = useArtists({ page, limit: DEFAULT_PAGE_SIZE });

  return (
    <div>
      <PageHeader
        title="هنرمندان"
        description={data ? `${formatFaNumber(data.meta.totalItems)} هنرمند فعال در پلتفرم` : 'مدیریت پروفایل هنرمندان'}
      />

      <Card>
        {isLoading ? (
          <div className="space-y-3 p-5">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : !data?.items.length ? (
          <EmptyState icon={Mic2} title="هنرمندی یافت نشد" />
        ) : (
          <Table>
            <THead>
              <tr>
                <Th>نام مستعار</Th>
                <Th>وضعیت</Th>
                <Th>شنوندگان ماهانه</Th>
                <Th>تاریخ عضویت</Th>
                <Th className="text-end">عملیات</Th>
              </tr>
            </THead>
            <TBody>
              {data.items.map((a) => (
                <Tr key={a.id}>
                  <Td className="font-medium">{a.stageName}</Td>
                  <Td>
                    <VerifiedBadge verified={a.isVerified} />
                  </Td>
                  <Td className="text-muted-foreground">{formatFaCompact(a.monthlyListeners)}</Td>
                  <Td className="text-muted-foreground">{formatJalaliShort(a.createdAt)}</Td>
                  <Td className="text-end">
                    <button
                      type="button"
                      onClick={() => setEditingArtist(a)}
                      className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                      aria-label="ویرایش"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                  </Td>
                </Tr>
              ))}
            </TBody>
          </Table>
        )}

        {data && <PaginationBar meta={data.meta} onPageChange={setPage} />}
      </Card>

      {editingArtist && <ArtistFormDialog artist={editingArtist} onClose={() => setEditingArtist(null)} />}
    </div>
  );
}
