import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils/index';

interface SectionHeaderProps {
  title: string;
  seeAllHref?: string;
  className?: string;
}

export function SectionHeader({ title, seeAllHref, className }: SectionHeaderProps) {
  return (
    <div className={cn('flex items-center justify-between mb-4', className)}>
      <h2 className="text-xl font-bold tracking-tight truncate">{title}</h2>
      {seeAllHref && (
        <Link
          href={seeAllHref}
          className="flex items-center gap-0.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors shrink-0 ml-4"
        >
          See all
          <ChevronRight className="h-3.5 w-3.5" aria-hidden />
        </Link>
      )}
    </div>
  );
}