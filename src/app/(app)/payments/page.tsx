'use client';

import { CreditCard } from 'lucide-react';
import { paymentsService } from '@/services/payments.service';
import { useLocale } from '@/providers/locale-provider';
import { CardSkeleton } from '@/components/shared/skeleton';
import { EmptyState } from '@/components/shared/empty-state';
import { useQuery } from '@tanstack/react-query';
import type { PaymentStatus } from '@/types';

const STATUS_STYLES: Record<PaymentStatus, string> = {
  SUCCEEDED: 'text-primary bg-primary/10',
  PENDING: 'text-amber-500 bg-amber-500/10',
  FAILED: 'text-destructive bg-destructive/10',
  REFUNDED: 'text-muted-foreground bg-secondary',
};

export default function PaymentsPage() {
  const { t, format } = useLocale();
  const { data, isLoading } = useQuery({
    queryKey: ['payments', 'history'],
    queryFn: () => paymentsService.getHistory({ page: 1, limit: 50 }),
    staleTime: 60_000,
  });

  return (
    <div className="px-4 py-6 lg:px-8 max-w-3xl space-y-6">
      <header>
        <h1 className="flex items-center gap-2 text-2xl font-bold">
          <CreditCard className="h-6 w-6 text-primary" />
          {t('payments.title')}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {t('payments.description')}
        </p>
      </header>

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      ) : (data?.items?.length ?? 0) === 0 ? (
        <EmptyState
          icon={CreditCard}
          title={t('payments.emptyTitle')}
          description={t('payments.emptyDescription')}
        />
      ) : (
        <ul className="divide-y divide-border rounded-xl border border-border overflow-hidden">
          {data!.items.map(payment => (
            <li
              key={payment.id}
              className="flex items-center justify-between gap-4 bg-card px-4 py-3.5"
            >
              <div className="min-w-0">
                <p className="text-sm font-medium truncate">
                  {format.currency(payment.amountCents / 100, payment.currency)}
                </p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {format.date(payment.createdAt)} · {payment.provider.toLowerCase()}
                </p>
              </div>
              <span
                className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold ${STATUS_STYLES[payment.status] ?? 'bg-secondary'}`}
              >
                {t(`payments.status.${payment.status.toLowerCase()}` as never)}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
