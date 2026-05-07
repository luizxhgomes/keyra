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

// Story brand.2 (Epic BRAND-INTEGRATION): KPI value adaptativo via container
// queries. Escala com a largura do card (não da viewport), eliminando overflow
// em grids estreitos e permitindo grandeza dramática em hero. Brandbook §05
// Componentes documenta padrão `clamp(MIN, Ncqi, MAX)` em cards com tipografia
// variável. Tokens legados text-kpi-hero/text-kpi mantidos como fallback.
const VARIANT_VALUE_TEXT: Record<NonNullable<KPICardProps['variant']>, string> = {
  hero: 'text-[clamp(40px,16cqi,56px)] font-bold leading-none tracking-tight',
  secondary: 'text-[clamp(28px,13cqi,44px)] font-bold leading-none tracking-tight',
  compact: 'text-2xl font-semibold',
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
        // Story brand.2 — container query ativo + warm shadow hover (cocoa-based).
        // - container-type:inline-size habilita unidade `cqi` no value
        // - hover:shadow-warm-md = sombra cor cocoa, não slate (princípio motion KEYRA)
        // - overflow:hidden é rede de segurança caso clamp falhe em viewport extremo
        '@container flex flex-col gap-3 overflow-hidden shadow-warm-sm transition-shadow duration-base ease-out-soft hover:shadow-warm-md [container-type:inline-size]',
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
