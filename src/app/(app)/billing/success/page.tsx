'use client';

import { Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { CheckCircle2, ArrowRight, Home } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/constants/query-keys';
import { useLocale } from '@/providers/locale-provider';
import { ROUTES } from '@/lib/constants';

function SuccessContent() {
  const { t } = useLocale();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const qc = useQueryClient();

  // The Stripe webhook activates the subscription asynchronously; refreshing
  // the subscription cache picks the new state up when the user visits it.
  void qc.invalidateQueries({ queryKey: queryKeys.subscription.active() });
  void sessionId; // kept for parity with Stripe docs / debugging

  return (
    <div className="flex flex-col items-center justify-center gap-5 py-24 px-4 text-center">
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/15">
        <CheckCircle2 className="h-10 w-10 text-primary" aria-hidden />
      </div>
      <div className="space-y-2 max-w-md">
        <h1 className="text-2xl font-bold">{t('billing.successTitle')}</h1>
        <p className="text-sm text-muted-foreground leading-relaxed">
          {t('billing.successDescription')}
        </p>
      </div>
      <div className="flex flex-wrap items-center justify-center gap-3 mt-2">
        <Link
          href={ROUTES.SUBSCRIPTION}
          className="inline-flex items-center gap-2 rounded-md bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90 transition-opacity"
        >
          {t('billing.viewSubscription')} <ArrowRight className="h-4 w-4" />
        </Link>
        <Link
          href={ROUTES.HOME}
          className="inline-flex items-center gap-2 rounded-md border border-border px-5 py-2.5 text-sm font-medium hover:bg-secondary transition-colors"
        >
          <Home className="h-4 w-4" /> {t('billing.backHome')}
        </Link>
      </div>
    </div>
  );
}

export default function BillingSuccessPage() {
  return (
    <Suspense fallback={null}>
      <SuccessContent />
    </Suspense>
  );
}
