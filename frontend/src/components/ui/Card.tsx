import * as React from 'react';
import { cn } from '@/lib/utils';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  feat?: boolean;
  hover?: boolean;
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, feat, hover, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'rounded-[13px] border p-[22px] transition-all duration-200',
        feat
          ? 'bg-gradient-to-br from-acc-deep to-surface border-acc/30'
          : 'bg-surface border-line',
        hover && 'cursor-pointer hover:-translate-y-[3px] hover:border-line-2 hover:bg-surface-2',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
);
Card.displayName = 'Card';
