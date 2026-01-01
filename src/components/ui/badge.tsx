import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
    'inline-flex items-center px-2 py-0.5 text-xs font-medium uppercase tracking-wider transition-colors focus:outline-none focus:ring-1 focus:ring-ring focus:ring-offset-1',
    {
        variants: {
            variant: {
                default: 'bg-stone-900 dark:bg-stone-100 text-stone-50 dark:text-stone-900',
                secondary: 'bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300',
                success: 'bg-emerald-900 dark:bg-emerald-100 text-stone-50 dark:text-emerald-900',
                destructive: 'bg-red-900 dark:bg-red-100 text-stone-50 dark:text-red-900',
                warning: 'bg-amber-900 dark:bg-amber-100 text-stone-50 dark:text-amber-900',
                outline:
                    'border border-stone-300 dark:border-stone-700 text-stone-700 dark:text-stone-300',
            },
        },
        defaultVariants: {
            variant: 'default',
        },
    }
);

export interface BadgeProps
    extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
    return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
