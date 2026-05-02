'use client';

import Link from 'next/link';
import { AnimatePresence, m } from 'framer-motion';

import { Card } from '@/components/ui/card';
import { ComparativoTexto, type ComparativoTextoProps } from '@/components/keyra/ComparativoTexto';
import { variants } from '@/lib/motion/tokens';
import { formatCentsBRL } from '@/lib/money';
import { cn } from '@/lib/utils';

/**
 * `<KPICard>` — cartão de número absoluto (CON-UX-01).
 *
 * Spec: docs/ux/wireframes/06-componentes-criticos.md §2.
 *
 * `value` em CENTAVOS (integer) para evitar floating-point. Formatação centralizada
 * em `lib/money.ts` (`formatCentsBRL`).
 */
export interface KPICardProps {
  label: string;
  /** Valor em centavos (integer). */
  value: number;
  /** Default `true`: formata como BRL. `false`: número absoluto puro. */
  currency?: boolean;
  comparison?: Omit<ComparativoTextoProps, 'format' | 'className'> & {
    direction?: 'up' | 'down';
  };
  helper?: string;
  action?: { label: string; href: string };
  variant?: 'hero' | 'secondary' | 'compact';
  loading?: boolean;
  className?: string;
}

const VARIANT_PADDING: Record<NonNullable<KPICardProps['variant']>, string> = {
  hero: 'px-card-x-hero py-card-y-hero',
  secondary: 'px-card-x py-card-y',
  compact: 'p-4',
};

// Story 6.1 — tokens semânticos `text-kpi-hero` (56px / 1.0 / 600) e
// `text-kpi` (40px / 1.0 / 600) substituem `text-5xl`/`text-4xl`. `compact`
// permanece sem token (caso de uso secundário, não mapeado).
const VARIANT_VALUE_TEXT: Record<NonNullable<KPICardProps['variant']>, string> = {
  hero: 'text-kpi-hero',
  secondary: 'text-kpi',
  compact: 'text-2xl',
};

export function KPICard({
  label,
  value,
  currency = true,
  comparison,
  helper,
  action,
  variant = 'secondary',
  loading = false,
  className,
}: KPICardProps) {
  const formatted = currency ? formatCentsBRL(value) : value.toLocaleString('pt-BR');

  return (
    <Card
      role="group"
      aria-label={label}
      className={cn(
        // Story 6.2 (AC2.10) — sombra animada em hover sinaliza interatividade
        // do KPICard. Usa transform implícito do `transition-shadow` (não toca
        // dimensão — AC2.12 preservado).
        'flex flex-col gap-3 shadow-sm transition-shadow duration-150 ease-out hover:shadow-md',
        VARIANT_PADDING[variant],
        className,
      )}
    >
      <p className="text-label uppercase text-muted-foreground">{label}</p>

      {loading ? (
        <div className={cn('h-12 w-2/3 animate-pulse rounded bg-muted', variant === 'hero' && 'h-16')} />
      ) : (
        // Story 6.2 (AC2.1 + P5) — `AnimatePresence mode="wait"` força fade-out
        // completo antes do fade-in do novo valor. Princípio CON-UX-01: nunca
        // animar morphing entre valores numéricos (poderia parecer percentual
        // ou intermediário). Cada valor é um snapshot discreto.
        <AnimatePresence mode="wait" initial={false}>
          <m.span
            key={formatted}
            variants={variants.fadeRiseExitUp}
            initial="hidden"
            animate="visible"
            exit="exit"
            aria-live="polite"
            data-kpi-value
            className={cn('text-foreground tabular-nums', VARIANT_VALUE_TEXT[variant])}
          >
            {formatted}
          </m.span>
        </AnimatePresence>
      )}

      {helper && <p className="text-xs text-muted-foreground">{helper}</p>}

      {comparison && !loading && (
        <ComparativoTexto
          delta={comparison.delta}
          period={comparison.period}
          sentiment={comparison.sentiment}
          format="full"
        />
      )}

      {action && (
        <div className="mt-auto pt-2">
          <Link
            href={action.href}
            className="inline-flex items-center text-sm font-medium text-primary hover:underline"
          >
            {action.label} →
          </Link>
        </div>
      )}
    </Card>
  );
}
