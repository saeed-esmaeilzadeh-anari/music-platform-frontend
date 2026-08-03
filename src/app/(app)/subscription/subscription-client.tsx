'use client';

import { useState } from 'react';
import {
  Check, Crown, Zap, Users, X, CreditCard, Calendar, AlertCircle,
} from 'lucide-react';
import {
  useActiveSubscription,
  useCreateCheckoutSession,
  useCancelSubscription,
  usePaymentHistory,
} from '@/hooks/use-user-data';
import { cn, formatDate, formatCents } from '@/lib/utils/index';
import { PLAN_LABELS } from '@/lib/constants';
import type { SubscriptionPlanInput } from '@/types';

// ─── Plan card data ───────────────────────────────────────────────────────────

interface PlanConfig {
  plan: SubscriptionPlanInput;
  label: string;
  price: string;
  period: string;
  highlight?: boolean;
  badge?: string;
  icon: React.ElementType;
  features: string[];
}

const PLANS: PlanConfig[] = [
  {
    plan: 'PREMIUM_MONTHLY',
    label: 'Premium Monthly',
    price: '$9.99',
    period: '/month',
    icon: Zap,
    features: [
      'Ad-free listening',
      'Offline downloads',
      'Lossless audio quality',
      'Unlimited skips',
      'Cross-device sync',
    ],
  },
  {
    plan: 'PREMIUM_YEARLY',
    label: 'Premium Yearly',
    price: '$99.99',
    period: '/year',
    highlight: true,
    badge: 'Best value — save 17%',
    icon: Crown,
    features: [
      'Everything in Monthly',
      '2 months free',
      'Priority customer support',
      'Early access to new features',
      'Exclusive artist content',
    ],
  },
  {
    plan: 'FAMILY',
    label: 'Family Plan',
    price: '$14.99',
    period: '/month',
    icon: Users,
    features: [
      'Up to 6 accounts',
      'Each member gets Premium',
      'Individual listening history',
      'Parental controls',
      'Shared family playlist',
    ],
  },
];

// ─── Active subscription banner ───────────────────────────────────────────────

function ActiveSubscriptionBanner() {
  const { data: sub, isLoading } = useActiveSubscription();
  const cancelMutation = useCancelSubscription();
  const [confirmCancel, setConfirmCancel] = useState(false);

  if (isLoading) return <div className="h-28 rounded-xl bg-secondary skeleton" />;
  if (!sub || sub.plan === 'FREE') return null;

  return (
    <div className="rounded-xl border border-primary/30 bg-primary/5 p-6 mb-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Crown className="h-5 w-5 text-primary" aria-hidden />
            <span className="font-semibold text-foreground">{PLAN_LABELS[sub.plan]}</span>
            <span className={cn(
              'rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-widest',
              sub.status === 'ACTIVE'   ? 'bg-emerald-500/15 text-emerald-500' :
              sub.status === 'PAST_DUE' ? 'bg-amber-500/15 text-amber-500'    :
                                          'bg-muted text-muted-foreground',
            )}>
              {sub.status}
            </span>
          </div>
          {sub.currentPeriodEnd && (
            <p className="text-sm text-muted-foreground flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5" />
              {sub.cancelAtPeriodEnd
                ? `Access until ${formatDate(sub.currentPeriodEnd)}`
                : `Renews ${formatDate(sub.currentPeriodEnd)}`}
            </p>
          )}
          {sub.cancelAtPeriodEnd && (
            <p className="mt-1 flex items-center gap-1.5 text-sm text-amber-500">
              <AlertCircle className="h-3.5 w-3.5" />
              Cancellation scheduled at period end
            </p>
          )}
        </div>

        {!sub.cancelAtPeriodEnd && (
          confirmCancel ? (
            <div className="flex items-center gap-2">
              <p className="text-sm text-muted-foreground">Are you sure?</p>
              <button type="button" onClick={() => { cancelMutation.mutate(); setConfirmCancel(false); }}
                disabled={cancelMutation.isPending}
                className="rounded-md bg-destructive px-3 py-1.5 text-xs font-medium text-destructive-foreground hover:opacity-90 disabled:opacity-50">
                {cancelMutation.isPending ? 'Cancelling…' : 'Yes, cancel'}
              </button>
              <button type="button" onClick={() => setConfirmCancel(false)}
                className="rounded-md border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground">
                Keep plan
              </button>
            </div>
          ) : (
            <button type="button" onClick={() => setConfirmCancel(true)}
              className="text-sm text-muted-foreground hover:text-destructive transition-colors flex items-center gap-1.5">
              <X className="h-4 w-4" /> Cancel plan
            </button>
          )
        )}
      </div>
    </div>
  );
}

// ─── Plan card ────────────────────────────────────────────────────────────────

function PlanCard({ plan }: { plan: PlanConfig }) {
  const checkout = useCreateCheckoutSession();
  const { data: activeSub } = useActiveSubscription();
  const isCurrentPlan = activeSub?.plan === plan.plan && activeSub.status === 'ACTIVE';
  const Icon = plan.icon;

  return (
    <div className={cn(
      'relative flex flex-col rounded-xl border p-6 transition-all duration-200',
      plan.highlight
        ? 'border-primary bg-primary/5 shadow-lg shadow-primary/10'
        : 'border-border bg-card hover:border-primary/40',
    )}>
      {plan.badge && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <span className="rounded-full bg-primary px-3 py-1 text-[11px] font-semibold text-primary-foreground whitespace-nowrap">
            {plan.badge}
          </span>
        </div>
      )}

      <div className="flex items-center gap-3 mb-5">
        <div className={cn('flex h-10 w-10 items-center justify-center rounded-full',
          plan.highlight ? 'bg-primary/20' : 'bg-secondary')}>
          <Icon className={cn('h-5 w-5', plan.highlight ? 'text-primary' : 'text-muted-foreground')} />
        </div>
        <div>
          <p className="font-semibold text-sm">{plan.label}</p>
        </div>
      </div>

      <div className="mb-6">
        <span className="text-3xl font-extrabold tracking-tight">{plan.price}</span>
        <span className="text-muted-foreground text-sm">{plan.period}</span>
      </div>

      <ul className="space-y-2.5 mb-8 flex-1">
        {plan.features.map((feat) => (
          <li key={feat} className="flex items-start gap-2.5 text-sm">
            <Check className="h-4 w-4 text-primary shrink-0 mt-px" aria-hidden />
            <span className="text-muted-foreground">{feat}</span>
          </li>
        ))}
      </ul>

      <button
        type="button"
        disabled={isCurrentPlan || checkout.isPending}
        onClick={() => checkout.mutate({ plan: plan.plan })}
        className={cn(
          'w-full rounded-lg py-2.5 text-sm font-semibold transition-all',
          isCurrentPlan
            ? 'bg-secondary text-muted-foreground cursor-default'
            : plan.highlight
              ? 'bg-primary text-primary-foreground hover:opacity-90'
              : 'border border-border text-foreground hover:bg-secondary hover:border-primary/40',
        )}
      >
        {isCurrentPlan ? 'Current plan' : checkout.isPending ? 'Redirecting…' : 'Get started'}
      </button>
    </div>
  );
}

// ─── Payment history ──────────────────────────────────────────────────────────

function PaymentHistory() {
  const { data, isLoading } = usePaymentHistory({ limit: 10 });

  if (isLoading) return <div className="space-y-2">{Array.from({length:3}).map((_,i)=><div key={i} className="h-12 rounded-md bg-secondary skeleton"/>)}</div>;
  if (!data?.items.length) return (
    <p className="text-sm text-muted-foreground py-4">No payment history yet.</p>
  );

  return (
    <div className="divide-y divide-border">
      {data.items.map((payment) => (
        <div key={payment.id} className="flex items-center justify-between py-3.5">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary">
              <CreditCard className="h-4 w-4 text-muted-foreground" aria-hidden />
            </div>
            <div>
              <p className="text-sm font-medium capitalize">{payment.provider.toLowerCase()}</p>
              <p className="text-xs text-muted-foreground">{formatDate(payment.createdAt)}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm font-semibold">{formatCents(payment.amountCents, payment.currency)}</p>
            <p className={cn('text-[11px] font-medium capitalize',
              payment.status === 'SUCCEEDED' ? 'text-emerald-500' :
              payment.status === 'FAILED'    ? 'text-destructive'  :
                                               'text-muted-foreground')}>
              {payment.status.toLowerCase()}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── SubscriptionClient ───────────────────────────────────────────────────────

export function SubscriptionClient() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-10 lg:px-8">
      {/* Heading */}
      <div className="text-center mb-10">
        <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary mb-4">
          <Crown className="h-4 w-4" /> Soundwave Premium
        </span>
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">
          Music without limits
        </h1>
        <p className="mt-3 text-muted-foreground max-w-md mx-auto">
          Unlock the full Soundwave experience — offline listening, lossless audio, and no ads.
        </p>
      </div>

      {/* Active subscription */}
      <ActiveSubscriptionBanner />

      {/* Plan grid */}
      <div className="grid md:grid-cols-3 gap-6 mb-14">
        {PLANS.map((plan) => <PlanCard key={plan.plan} plan={plan} />)}
      </div>

      {/* Payment history */}
      <section className="rounded-xl border border-border bg-card p-6">
        <h2 className="text-base font-semibold mb-4 flex items-center gap-2">
          <CreditCard className="h-4 w-4" aria-hidden />
          Payment history
        </h2>
        <PaymentHistory />
      </section>
    </div>
  );
}