import * as React from 'react';
import { cn } from '@/lib/utils';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'ghost';
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center rounded-lg px-6 py-2 font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2',
          variant === 'default'
            ? 'bg-black text-white hover:bg-gray-900 border border-black/10 focus:ring-black dark:bg-white dark:text-black dark:hover:bg-gray-200 dark:border-white/10 dark:focus:ring-white'
            : 'bg-transparent text-black dark:text-white border border-black/30 dark:border-white/30 hover:bg-black/10 dark:hover:bg-white/10',
          className
        )}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button'; 