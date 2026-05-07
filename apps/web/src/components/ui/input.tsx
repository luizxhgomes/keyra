import * as React from 'react';

import { cn } from '@/lib/utils';

// Story brand.3 — Input com motion tokens KEYRA + calor crescente em hover/focus.
// Border bronze-500 no hover/focus (princípio motion §5: hover aquece, nunca esfria).
// Transition usa duration-fast + ease-out-soft.
const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background transition-colors duration-fast ease-out-soft file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground hover:border-bronze-500 focus-visible:border-bronze-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
          className,
        )}
        ref={ref}
        {...props}
      />
    );
  },
);
Input.displayName = 'Input';

export { Input };
