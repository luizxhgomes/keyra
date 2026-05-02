'use client';

import { m } from 'framer-motion';
import type { ReactNode } from 'react';

import { durations, easings } from '@/lib/motion/tokens';

/**
 * `<ScrollFadeRise>` (Story 6.2 AC2.9) — wrapper para scroll-triggered fadeRise.
 *
 * Aplica `whileInView` com `viewport={{ once: true, margin: '-10%' }}` —
 * elemento entra com fadeRise quando 10% dele está visível. **`once: true`**
 * preserva o princípio "motion como informação" (não re-anima ao scrollar
 * de volta).
 *
 * **Anti-pattern (AC2.12):** transform-only. Sem `margin`/`padding`/`width`/
 * `height` animados. Tokens de spacing da Sprint 5.5 ficam intactos.
 *
 * Uso:
 *
 * ```tsx
 * <ScrollFadeRise>
 *   <AlertasCard />
 * </ScrollFadeRise>
 * ```
 */
export function ScrollFadeRise({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <m.div
      initial={{ opacity: 0, y: 8 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-10%' }}
      transition={{ duration: durations.slow, ease: easings.out }}
      className={className}
    >
      {children}
    </m.div>
  );
}
