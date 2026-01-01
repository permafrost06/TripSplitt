import * as React from 'react';
import { cn } from '@/lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
    ({ className, type, ...props }, ref) => {
        return (
            <input
                type={type}
                className={cn(
                    'flex h-10 w-full border border-stone-300 dark:border-stone-700 bg-transparent px-4 py-2 text-sm text-stone-900 dark:text-stone-100 transition-all file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-stone-400 dark:placeholder:text-stone-500 focus:outline-none focus:ring-1 focus:ring-stone-400 dark:focus:ring-stone-600 disabled:cursor-not-allowed disabled:opacity-50',
                    className
                )}
                ref={ref}
                {...props}
            />
        );
    }
);
Input.displayName = 'Input';

export { Input };
