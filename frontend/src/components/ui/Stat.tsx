import * as React from 'react';
import { cn } from '@/lib/utils';

export function Stat({
  value,
  unit,
  label,
  className,
}: {
  value: React.ReactNode;
  unit?: string;
  label: string;
  className?: string;
}) {
  return (
    <div className={cn('text-center p-1.5', className)}>
      <div className="font-display font-bold text-[1.9rem] leading-none text-ink">
        {value}
        {unit && <span className="text-acc">{unit}</span>}
      </div>
      <div className="text-[.8rem] text-muted mt-1.5">{label}</div>
    </div>
  );
}

export function StatCard({
  value,
  label,
  className,
}: {
  value: React.ReactNode;
  label: string;
  className?: string;
}) {
  return (
    <div className={cn('bg-surface border border-line rounded-[13px] px-4 py-3.5', className)}>
      <div className="font-display font-bold text-[1.6rem] text-acc">{value}</div>
      <div className="text-[.72rem] text-muted uppercase tracking-[.05em] mt-0.5">{label}</div>
    </div>
  );
}
