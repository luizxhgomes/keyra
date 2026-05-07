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
        '@container flex flex-col gap-3 overflow-hidden shadow-warm-sm transition-shadow duration-base ease-out-soft hover:shadow-warm-md [container-type:inline-size]',
        VARIANT_PADDING[variant],
        className,
      )}
    >
      {/*
        Story brand.5 — KPI reveal narrativo em 3 atos via kpiRevealContainer.
        Stagger 80ms entre label → value → comparativo. Princípio CON-UX-01
        executado em motion: cada elemento entra como ato discreto.
        Reference: docs/brand/03-identity/motion-system/motion-vocabulary.md §3
      */}
      <m.div
        variants={variants.kpiRevealContainer}
        initial="hidden"
        animate="visible"
        className="contents"
      >
        <m.p
          variants={variants.kpiRevealItem}
          className="text-label uppercase text-muted-foreground"
        >
          {label}
        </m.p>

        {loading ? (
          <m.div
            variants={variants.kpiRevealItem}
            className={cn('h-12 w-2/3 animate-pulse rounded bg-muted', variant === 'hero' && 'h-16')}
          />
        ) : (
          // AnimatePresence preserva o pattern P5 (fade-out completo antes
          // de fade-in quando o valor muda dinamicamente). Wrapper m.div
          // com kpiRevealItem garante entrada narrativa no 1º render.
          <m.div variants={variants.kpiRevealItem}>
            <AnimatePresence mode="wait" initial={false}>
              <m.span
                key={formatted}
                variants={variants.fadeRiseExitUp}
                initial="hidden"
                animate="visible"
                exit="exit"
                aria-live="polite"
                data-kpi-value
                className={cn('text-foreground tabular-nums block', VARIANT_VALUE_TEXT[variant])}
              >
                {formatted}
              </m.span>
            </AnimatePresence>
          </m.div>
        )}

        {helper && (
          <m.p variants={variants.kpiRevealItem} className="text-xs text-muted-foreground">
            {helper}
          </m.p>
        )}

        {comparison && !loading && (
          <m.div variants={variants.kpiRevealItem}>
            <ComparativoTexto
              delta={comparison.delta}
              period={comparison.period}
              sentiment={comparison.sentiment}
              format="full"
            />
          </m.div>
        )}
      </m.div>

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
