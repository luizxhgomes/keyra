'use client';

import { Children, isValidElement } from 'react';
import { m } from 'framer-motion';

import { variants } from '@/lib/motion/tokens';
import { cn } from '@/lib/utils';

/**
 * `<StaggerList>` — listagem com entrada em cascata (Story brand.5).
 *
 * Wrappa filhos em `m.div` com variant `staggerList` (80ms entre items)
 * ou `staggerListTight` (40ms para listas densas ≥10 items).
 *
 * Cada filho direto recebe `variants={variants.kpiRevealItem}` automaticamente
 * via `Children.map`, mantendo a sequência narrativa do brandbook.
 *
 * `prefers-reduced-motion` é respeitado pelo CSS layer global (globals.css)
 * que zera transition-duration. Framer Motion também respeita via reducedMotion.
 *
 * Reference: docs/brand/03-identity/motion-system/motion-vocabulary.md §6
 *
 * @example
 * ```tsx
 * <StaggerList as="ul" className="divide-y divide-border">
 *   {patients.map((p) => (
 *     <li key={p.id}>...</li>
 *   ))}
 * </StaggerList>
 * ```
 */
export interface StaggerListProps {
  children: React.ReactNode;
  /** Componente HTML de container (default: `div`). Use `ul` para semântica de lista. */
  as?: 'div' | 'ul' | 'ol' | 'section';
  /** `'default'` 80ms (padrão) · `'tight'` 40ms (listas densas). */
  cadence?: 'default' | 'tight';
  className?: string;
}

export function StaggerList({
  children,
  as = 'div',
  cadence = 'default',
  className,
}: StaggerListProps) {
  const containerVariant = cadence === 'tight' ? variants.staggerListTight : variants.staggerList;
  const Component = m[as] as typeof m.div;

  return (
    <Component
      variants={containerVariant}
      initial="hidden"
      animate="visible"
      className={cn(className)}
    >
      {Children.map(children, (child, index) => {
        if (!isValidElement(child)) return child;
        // Wrappa cada filho em m.div com variant kpiRevealItem para herdar
        // o stagger do container. Mantém estrutura de DOM original (key/props).
        return (
          <m.div key={(child as React.ReactElement<{ key?: string }>).key ?? index} variants={variants.kpiRevealItem}>
            {child}
          </m.div>
        );
      })}
    </Component>
  );
}
