'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toFaDigits } from '@/lib/utils/format-fa';
import type { PaginationMeta } from '@/types';

interface PaginationBarProps {
  meta: PaginationMeta;
  onPageChange: (page: number) => void;
  className?: string;
}

/**
 * RTL-aware pagination. In right-to-left reading order, "forward" (next)
 * moves visually leftward, so the next/previous chevrons are intentionally
 * swapped relative to an LTR pager.
 */
export function PaginationBar({ meta, onPageChange, className }: PaginationBarProps) {
  const { page, totalPages, totalItems, hasNextPage, hasPreviousPage } = meta;

  if (totalItems === 0) return null;

  const from = (page - 1) * meta.limit + 1;
  const to = Math.min(page * meta.limit, totalItems);

  return (
    <div
      className={cn(
        'flex flex-wrap items-center justify-between gap-3 border-t border-border px-5 py-3.5',
        className,
      )}
    >
      <p className="text-xs text-muted-foreground">
        نمایش <span className="font-medium text-foreground">{toFaDigits(from)}</span>
        {' تا '}
        <span className="font-medium text-foreground">{toFaDigits(to)}</span>
        {' از '}
        <span className="font-medium text-foreground">{toFaDigits(totalItems)}</span> مورد
      </p>

      <div className="flex items-center gap-1.5">
        <button
          type="button"
          onClick={() => onPageChange(page - 1)}
          disabled={!hasPreviousPage}
          className="inline-flex h-8 items-center gap-1 rounded-md border border-border px-2.5 text-xs font-medium text-foreground transition-colors hover:bg-secondary disabled:pointer-events-none disabled:opacity-40"
        >
          <ChevronRight className="h-3.5 w-3.5" aria-hidden />
          قبلی
        </button>

        <span className="px-2 text-xs text-muted-foreground">
          صفحه <span className="font-medium text-foreground">{toFaDigits(page)}</span> از{' '}
          <span className="font-medium text-foreground">{toFaDigits(totalPages)}</span>
        </span>

        <button
          type="button"
          onClick={() => onPageChange(page + 1)}
          disabled={!hasNextPage}
          className="inline-flex h-8 items-center gap-1 rounded-md border border-border px-2.5 text-xs font-medium text-foreground transition-colors hover:bg-secondary disabled:pointer-events-none disabled:opacity-40"
        >
          بعدی
          <ChevronLeft className="h-3.5 w-3.5" aria-hidden />
        </button>
      </div>
    </div>
  );
}
