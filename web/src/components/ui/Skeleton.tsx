import React from 'react';
import { cn } from '../../lib/utils';

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
  'data-testid'?: string;
}

/**
 * Base atomic Skeleton loader with subtle clinical pulse animation.
 */
export const Skeleton: React.FC<SkeletonProps> = ({
  className = '',
  'data-testid': testId = 'skeleton',
  ...props
}) => {
  return (
    <div
      data-testid={testId}
      className={cn('animate-pulse bg-slate-200/80 rounded-lg', className)}
      aria-hidden="true"
      {...props}
    />
  );
};

/**
 * Skeleton simulation for PetCard component (zero CLS).
 */
export const PetCardSkeleton: React.FC<{ className?: string; 'data-testid'?: string }> = ({
  className = '',
  'data-testid': testId = 'pet-card-skeleton',
}) => {
  return (
    <div
      data-testid={testId}
      className={cn(
        'bg-white rounded-xl border border-slate-200 p-4 shadow-sm flex flex-col justify-between',
        className
      )}
      aria-hidden="true"
    >
      <div className="flex items-start gap-3">
        {/* Avatar skeleton */}
        <Skeleton className="w-12 h-12 rounded-full flex-shrink-0" />

        <div className="flex-1 min-w-0 space-y-2">
          {/* Name & Species badge */}
          <div className="flex items-center justify-between gap-2">
            <Skeleton className="h-5 w-24 rounded" />
            <Skeleton className="h-5 w-16 rounded-full" />
          </div>

          {/* Breed */}
          <Skeleton className="h-3.5 w-32 rounded" />

          {/* Weight & Sex */}
          <div className="flex items-center gap-3 pt-1">
            <Skeleton className="h-3.5 w-14 rounded" />
            <Skeleton className="h-3.5 w-16 rounded" />
          </div>

          {/* Microchip ISO badge */}
          <Skeleton className="h-5 w-36 rounded" />
        </div>
      </div>

      {/* Button placeholder */}
      <div className="mt-4 pt-3 border-t border-slate-100 flex justify-end">
        <Skeleton className="h-7 w-28 rounded-lg" />
      </div>
    </div>
  );
};

/**
 * Skeleton simulation for Vet consultation queue table / cards.
 */
export const ConsultationQueueSkeleton: React.FC<{
  rows?: number;
  className?: string;
  'data-testid'?: string;
}> = ({ rows = 3, className = '', 'data-testid': testId = 'consultation-queue-skeleton' }) => {
  return (
    <div data-testid={testId} className={cn('space-y-3', className)} aria-hidden="true">
      {Array.from({ length: rows }).map((_, idx) => (
        <div
          key={idx}
          className="p-4 border border-slate-200 rounded-xl bg-white shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
        >
          <div className="space-y-2 flex-1">
            <div className="flex items-center gap-2">
              <Skeleton className="h-4 w-36 rounded" />
              <Skeleton className="h-4 w-20 rounded" />
            </div>
            <Skeleton className="h-3 w-48 rounded" />
            <Skeleton className="h-4 w-16 rounded-full" />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <Skeleton className="h-8 w-24 rounded-lg" />
            <Skeleton className="h-8 w-24 rounded-lg" />
          </div>
        </div>
      ))}
    </div>
  );
};

/**
 * Skeleton simulation for official PrescriptionDoc printable document.
 */
export const PrescriptionDocSkeleton: React.FC<{
  className?: string;
  'data-testid'?: string;
}> = ({ className = '', 'data-testid': testId = 'prescription-doc-skeleton' }) => {
  return (
    <div
      data-testid={testId}
      className={cn(
        'bg-white border border-slate-300 rounded-2xl p-6 sm:p-8 max-w-2xl w-full shadow-lg space-y-6',
        className
      )}
      aria-hidden="true"
    >
      {/* Header skeleton */}
      <div className="border-b border-slate-200 pb-5 flex justify-between items-start gap-4">
        <div className="flex items-center gap-3">
          <Skeleton className="w-10 h-10 rounded-xl flex-shrink-0" />
          <div className="space-y-1.5">
            <Skeleton className="h-5 w-48 rounded" />
            <Skeleton className="h-3.5 w-40 rounded" />
          </div>
        </div>
        <div className="flex flex-col items-end space-y-1.5">
          <Skeleton className="h-5 w-32 rounded-full" />
          <Skeleton className="h-3 w-20 rounded" />
        </div>
      </div>

      {/* Info grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-50 border border-slate-100 p-4 rounded-xl">
        <div className="space-y-1.5">
          <Skeleton className="h-3 w-28 rounded" />
          <Skeleton className="h-4 w-36 rounded" />
          <Skeleton className="h-3.5 w-32 rounded" />
        </div>
        <div className="space-y-1.5">
          <Skeleton className="h-3 w-28 rounded" />
          <Skeleton className="h-4 w-32 rounded" />
          <Skeleton className="h-3 w-24 rounded" />
        </div>
      </div>

      {/* Patient info box */}
      <div className="border border-slate-200 rounded-xl p-4 space-y-3">
        <Skeleton className="h-3.5 w-32 rounded" />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Skeleton className="h-8 rounded" />
          <Skeleton className="h-8 rounded" />
          <Skeleton className="h-8 rounded" />
          <Skeleton className="h-8 rounded" />
        </div>
      </div>

      {/* Rp/ pharmacological block */}
      <div className="space-y-4">
        <div className="border border-slate-200 rounded-xl p-4 sm:p-5 space-y-3">
          <div className="flex items-center gap-2">
            <Skeleton className="h-6 w-8 rounded" />
            <Skeleton className="h-4 w-36 rounded" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Skeleton className="h-10 rounded" />
            <Skeleton className="h-10 rounded" />
            <Skeleton className="h-10 rounded" />
          </div>
        </div>

        <div className="border border-amber-200/60 rounded-xl p-4 bg-amber-50/20 space-y-2">
          <Skeleton className="h-3.5 w-40 rounded" />
          <Skeleton className="h-3 w-full rounded" />
          <Skeleton className="h-3 w-4/5 rounded" />
        </div>
      </div>

      {/* Footer & QR code */}
      <div className="border-t border-slate-200 pt-5 flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="space-y-2 w-full sm:w-auto">
          <Skeleton className="h-3.5 w-36 rounded" />
          <Skeleton className="h-3 w-64 rounded" />
        </div>
        <Skeleton className="w-24 h-24 rounded-lg flex-shrink-0" />
      </div>
    </div>
  );
};

export default Skeleton;
