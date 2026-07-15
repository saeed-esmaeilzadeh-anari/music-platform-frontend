import { cn } from "@/lib/utils";

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
  return <div className={cn("skeleton rounded-md", className)} aria-hidden />;
}

export function TrackRowSkeleton() {
  return (
    <div className="flex items-center gap-3 px-4 py-2.5">
      <Skeleton className="h-4 w-4 shrink-0" />
      <Skeleton className="h-10 w-10 shrink-0 rounded" />
      <div className="flex-1 space-y-1.5 min-w-0">
        <Skeleton className="h-3.5 w-40" />
        <Skeleton className="h-3 w-24" />
      </div>
      <Skeleton className="h-3 w-10 shrink-0" />
    </div>
  );
}

export function CardSkeleton() {
  return (
    <div className="space-y-3">
      <Skeleton className="aspect-square w-full rounded-md" />
      <div className="space-y-1.5 px-1">
        <Skeleton className="h-3.5 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
      </div>
    </div>
  );
}

export function ArtistCardSkeleton() {
  return (
    <div className="space-y-3 text-center">
      <Skeleton className="aspect-square w-full rounded-full" />
      <div className="space-y-1.5 px-1">
        <Skeleton className="h-3.5 w-3/4 mx-auto" />
        <Skeleton className="h-3 w-1/2 mx-auto" />
      </div>
    </div>
  );
}

export function DetailHeroSkeleton() {
  return (
    <div className="flex gap-6 p-6 lg:p-8">
      <Skeleton className="h-48 w-48 shrink-0 rounded-md" />
      <div className="flex-1 space-y-3 pt-4">
        <Skeleton className="h-3 w-20" />
        <Skeleton className="h-8 w-56" />
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-4 w-24" />
      </div>
    </div>
  );
}
