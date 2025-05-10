import * as React from 'react';
import { cn } from '@/lib/utils';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'rounded-xl bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700 shadow',
        className
      )}
      {...props}
    />
  )
);
Card.displayName = 'Card'; 