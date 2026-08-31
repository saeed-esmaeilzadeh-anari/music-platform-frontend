import type { LucideIcon } from 'lucide-react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatFaNumber } from '@/lib/utils/format-fa';

interface StatCardProps {
  label: string;
  value: number | string;
  icon: LucideIcon;
  tone?: 'primary' | 'success' | 'info' | 'warning' | 'danger';
  hint?: string;
  /** Optional trend: positive = green ↑, negative = red ↓, zero = flat */
  trend?: { value: number; label?: string };
  loading?: boolean;
}

const TONE_ICON_BG: Record<NonNullable<StatCardProps['tone']>, string> = {
  primary: 'bg-primary/15 text-primary',
  success: 'bg-emerald-500/15 text-emerald-400',
  info:    'bg-sky-500/15 text-sky-400',
  warning: 'bg-amber-500/15 text-amber-400',
  danger:  'bg-destructive/15 text-destructive',
};

export function StatCard({ label, value, icon: Icon, tone = 'primary', hint, trend, loading }: StatCardProps) {
  return (
    <div className={cn(
      'rounded-lg border border-border bg-card p-5 shadow-sm',
      'transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md hover:border-border/80',
    )}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="truncate text-xs font-medium uppercase tracking-wider text-muted-foreground">
            {label}
          </p>

          {loading ? (
            <>
              <div className="mt-3 h-7 w-24 animate-pulse rounded-md bg-muted" />
              <div className="mt-2.5 h-4 w-16 animate-pulse rounded bg-muted" />
            </>
          ) : (
            <>
              <p className="mt-3 text-2xl font-bold tracking-tight text-foreground tabular-nums">
                {typeof value === 'number' ? formatFaNumber(value) : value}
              </p>

              {trend !== undefined && (
                <p className="mt-1.5 flex items-center gap-1 text-xs">
                  {trend.value > 0 ? (
                    <>
                      <span className="flex items-center gap-0.5 font-medium text-emerald-400">
                        <TrendingUp className="h-3.5 w-3.5" aria-hidden />
                        {formatFaNumber(trend.value)}٪
                      </span>
                      {trend.label && <span className="text-muted-foreground">{trend.label}</span>}
                    </>
                  ) : trend.value < 0 ? (
                    <>
                      <span className="flex items-center gap-0.5 font-medium text-destructive">
                        <TrendingDown className="h-3.5 w-3.5" aria-hidden />
                        {formatFaNumber(Math.abs(trend.value))}٪
                      </span>
                      {trend.label && <span className="text-muted-foreground">{trend.label}</span>}
                    </>
                  ) : (
                    <span className="flex items-center gap-0.5 text-muted-foreground">
                      <Minus className="h-3.5 w-3.5" aria-hidden />
                      {trend.label ?? 'بدون تغییر'}
                    </span>
                  )}
                </p>
              )}

              {hint && !trend && (
                <p className="mt-1.5 truncate text-xs text-muted-foreground">{hint}</p>
              )}
            </>
          )}
        </div>

        {/* Icon bubble — Velzon-style circle with tone colour */}
        <div className={cn(
          'flex h-12 w-12 shrink-0 items-center justify-center rounded-full',
          TONE_ICON_BG[tone],
        )}>
          <Icon className="h-6 w-6" aria-hidden />
        </div>
      </div>
    </div>
  );
}
