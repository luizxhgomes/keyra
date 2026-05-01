import Link from 'next/link';

import { Card } from '@/components/ui/card';
import { ComparativoTexto, type ComparativoTextoProps } from '@/components/keyra/ComparativoTexto';
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

const VARIANT_VALUE_TEXT: Record<NonNullable<KPICardProps['variant']>, string> = {
  hero: 'text-5xl',
  secondary: 'text-4xl',
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
      className={cn('flex flex-col gap-3', VARIANT_PADDING[variant], className)}
    >
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>

      {loading ? (
        <div className={cn('h-12 w-2/3 animate-pulse rounded bg-muted', variant === 'hero' && 'h-16')} />
      ) : (
        <span
          aria-live="polite"
          data-kpi-value
          className={cn('font-bold text-foreground tabular-nums', VARIANT_VALUE_TEXT[variant])}
        >
          {formatted}
        </span>
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
