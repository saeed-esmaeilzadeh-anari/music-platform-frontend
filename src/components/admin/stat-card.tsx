import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatFaNumber } from '@/lib/utils/format-fa';

interface StatCardProps {
  label: string;
  value: number | string;
  icon: LucideIcon;
  tone?: 'primary' | 'success' | 'info' | 'warning' | 'danger';
  hint?: string;
  loading?: boolean;
}

const TONE_STYLES: Record<NonNullable<StatCardProps['tone']>, string> = {
  primary: 'bg-primary/15 text-primary',
  success: 'bg-emerald-500/15 text-emerald-400',
  info: 'bg-sky-500/15 text-sky-400',
  warning: 'bg-amber-500/15 text-amber-400',
  danger: 'bg-destructive/15 text-destructive',
};

export function StatCard({ label, value, icon: Icon, tone = 'primary', hint, loading }: StatCardProps) {
  return (
    <div className="rounded-lg border border-border bg-card p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-medium text-muted-foreground">{label}</p>
          {loading ? (
            <div className="skeleton mt-2.5 h-7 w-20 rounded-md bg-muted" />
          ) : (
            <p className="mt-1.5 text-2xl font-bold tracking-tight text-foreground">
              {typeof value === 'number' ? formatFaNumber(value) : value}
            </p>
          )}
          {hint && <p className="mt-1.5 truncate text-xs text-muted-foreground">{hint}</p>}
        </div>
        <div className={cn('flex h-10 w-10 shrink-0 items-center justify-center rounded-md', TONE_STYLES[tone])}>
          <Icon className="h-5 w-5" aria-hidden />
        </div>
      </div>
    </div>
  );
}
