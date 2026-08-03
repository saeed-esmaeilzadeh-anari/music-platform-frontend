import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium leading-none whitespace-nowrap',
  {
    variants: {
      tone: {
        neutral: 'bg-secondary text-secondary-foreground',
        primary: 'bg-primary/15 text-primary',
        success: 'bg-emerald-500/15 text-emerald-400',
        warning: 'bg-amber-500/15 text-amber-400',
        danger: 'bg-destructive/15 text-destructive',
        info: 'bg-sky-500/15 text-sky-400',
      },
    },
    defaultVariants: { tone: 'neutral' },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {
  dot?: boolean;
}

export function Badge({ className, tone, dot, children, ...props }: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ tone }), className)} {...props}>
      {dot && <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-current" aria-hidden />}
      {children}
    </span>
  );
}

// ─── Domain-specific badge helpers ─────────────────────────────────────────────

import type { Role, TrackStatus } from '@/types';
import { FA_ROLE_LABELS, FA_TRACK_STATUS_LABELS } from '@/lib/constants/admin';

const ROLE_TONE: Record<Role, BadgeProps['tone']> = {
  ADMIN: 'danger',
  MODERATOR: 'info',
  ARTIST: 'primary',
  LISTENER: 'neutral',
};

export function RoleBadge({ role }: { role: Role }) {
  return <Badge tone={ROLE_TONE[role]}>{FA_ROLE_LABELS[role]}</Badge>;
}

const TRACK_STATUS_TONE: Record<TrackStatus, BadgeProps['tone']> = {
  PUBLISHED: 'success',
  PROCESSING: 'info',
  DRAFT: 'neutral',
  REJECTED: 'danger',
  ARCHIVED: 'warning',
};

export function TrackStatusBadge({ status }: { status: TrackStatus }) {
  return <Badge tone={TRACK_STATUS_TONE[status]}>{FA_TRACK_STATUS_LABELS[status]}</Badge>;
}

export function VerifiedBadge({ verified }: { verified: boolean }) {
  return verified ? (
    <Badge tone="success">تأییدشده</Badge>
  ) : (
    <Badge tone="neutral">تأییدنشده</Badge>
  );
}

export function PublishedBadge({ published }: { published: boolean }) {
  return published ? (
    <Badge tone="success">منتشرشده</Badge>
  ) : (
    <Badge tone="warning">منتشرنشده</Badge>
  );
}
