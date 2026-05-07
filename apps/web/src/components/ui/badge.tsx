import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';

// Story brand.3 — Badge com variants semânticos KEYRA expandidos:
// + success (success-leaf — verde oliva editorial, não verde neon)
// + warning (amber-500)
// + premium (gold-500, ouro como acento precioso)
// Reference: docs/brand/03-identity/preview.html §05 (StatusBadge derivações)
const badgeVariants = cva(
  'inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-semibold tracking-wide transition-colors duration-fast ease-out-soft focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
  {
    variants: {
      variant: {
        default: 'border-transparent bg-primary text-primary-foreground',
        secondary: 'border-transparent bg-secondary text-secondary-foreground',
        destructive: 'border-transparent bg-destructive text-destructive-foreground',
        outline: 'border-mocha-300 text-foreground',
        muted: 'border-transparent bg-muted text-muted-foreground',
        success: 'border-transparent bg-success-leaf/20 text-success-deep',
        warning: 'border-transparent bg-amber-300/40 text-cocoa-900',
        premium: 'border-transparent bg-gold-500 text-cocoa-900',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
