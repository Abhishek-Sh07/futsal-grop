'use client';

import { cn } from '@/lib/utils/format';

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div className={cn('skeleton rounded-xl', className)} />
  );
}

export function StatCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-[var(--color-border)] p-4">
      <Skeleton className="h-3 w-24 mb-3" />
      <Skeleton className="h-7 w-32 mb-2" />
      <Skeleton className="h-3 w-16" />
    </div>
  );
}

export function PlayerCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-[var(--color-border)] p-4 flex items-center gap-3">
      <Skeleton className="w-10 h-10 rounded-full shrink-0" />
      <div className="flex-1">
        <Skeleton className="h-4 w-36 mb-2" />
        <Skeleton className="h-3 w-24" />
      </div>
      <Skeleton className="h-7 w-16 rounded-full" />
    </div>
  );
}

export function ListSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <PlayerCardSkeleton key={i} />
      ))}
    </div>
  );
}
