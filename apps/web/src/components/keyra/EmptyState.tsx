'use client';

import Link from 'next/link';
import { m } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { variants } from '@/lib/motion/tokens';
import { cn } from '@/lib/utils';

/**
 * `<EmptyState>` — placeholder para listas/seções vazias (Story 5.3).
 *
 * Padrão consistente: ícone outline + título + descrição em pt-BR + CTA real
 * (não "use o botão acima"). Persona-iniciante (mês 1 de uso) cai em todas
 * as listas vazias e precisa saber o próximo passo.
 *
 * Spec UX: docs/ux/PLANO-SPRINT-5-6.md §Story 5.3.
 */
export interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description: string;
  action?: {
    label: string;
    href?: string;
    onClick?: () => void;
  };
  /** Texto secundário sob o CTA (link adicional, dica). */
  hint?: React.ReactNode;
  className?: string;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  hint,
  className,
}: EmptyStateProps) {
  return (
    // Story 6.2 (AC2.8) — fadeRiseSlow (400ms, expo-out) no mount inicial.
    // Camila percebe que o card "apareceu", não que estava lá.
    <m.div
      variants={variants.fadeRiseSlow}
      initial="hidden"
      animate="visible"
      className={cn(
        'flex flex-col items-center justify-center gap-3 py-12 text-center',
        className,
      )}
    >
      {Icon ? (
        <div className="mb-1 rounded-full bg-muted p-3">
          <Icon
            className="h-6 w-6 text-muted-foreground"
            strokeWidth={1.5}
            aria-hidden="true"
          />
        </div>
      ) : null}
      <h3 className="text-base font-semibold tracking-tight text-foreground">
        {title}
      </h3>
      <p className="max-w-sm text-sm text-muted-foreground">{description}</p>
      {action ? (
        action.href ? (
          <Link href={action.href}>
            <Button size="sm" className="mt-2">
              {action.label}
            </Button>
          </Link>
        ) : (
          <Button size="sm" className="mt-2" onClick={action.onClick}>
            {action.label}
          </Button>
        )
      ) : null}
      {hint ? <div className="mt-1 text-xs text-muted-foreground">{hint}</div> : null}
    </m.div>
  );
}
