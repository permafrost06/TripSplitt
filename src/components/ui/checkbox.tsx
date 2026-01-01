import * as React from 'react';
import * as CheckboxPrimitive from '@radix-ui/react-checkbox';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

const Checkbox = React.forwardRef<
    React.ElementRef<typeof CheckboxPrimitive.Root>,
    React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root>
>(({ className, ...props }, ref) => (
    <CheckboxPrimitive.Root
        ref={ref}
        className={cn(
            'peer h-5 w-5 shrink-0 border-2 border-stone-300 dark:border-stone-600 transition-all focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-stone-400 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-stone-900 dark:data-[state=checked]:bg-stone-100 data-[state=checked]:border-stone-900 dark:data-[state=checked]:border-stone-100 data-[state=checked]:text-white dark:data-[state=checked]:text-stone-900',
            className
        )}
        {...props}
    >
        <CheckboxPrimitive.Indicator
            className={cn('flex items-center justify-center text-current')}
        >
            <Check className="h-4 w-4" strokeWidth={2} />
        </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
));
Checkbox.displayName = CheckboxPrimitive.Root.displayName;

export { Checkbox };
