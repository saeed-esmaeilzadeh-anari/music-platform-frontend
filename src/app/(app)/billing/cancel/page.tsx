'use client';

import Link from 'next/link';
import { XCircle, RotateCcw, Home } from 'lucide-react';
import { useLocale } from '@/providers/locale-provider';
import { ROUTES } from '@/lib/constants';

/**
 * Stripe returns here when the user abandons the checkout session.
 * No charge has happened; the user can retry or go back.
 */
export default function BillingCancelPage() {
  const { t } = useLocale();

  return (
    <div className="flex flex-col items-center justify-center gap-5 py-24 px-4 text-center">
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-secondary">
        <XCircle className="h-10 w-10 text-muted-foreground" aria-hidden />
      </div>
      <div className="space-y-2 max-w-md">
        <h1 className="text-2xl font-bold">{t('billing.cancelTitle')}</h1>
        <p className="text-sm text-muted-foreground leading-relaxed">
          {t('billing.cancelDescription')}
        </p>
      </div>
      <div className="flex flex-wrap items-center justify-center gap-3 mt-2">
        <Link
          href={ROUTES.SUBSCRIPTION}
          className="inline-flex items-center gap-2 rounded-md bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90 transition-opacity"
        >
          <RotateCcw className="h-4 w-4" /> {t('billing.tryAgain')}
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
