import { TrendingDown, TrendingUp } from 'lucide-react';

import { formatCentsBRL } from '@/lib/money';
import { cn } from '@/lib/utils';

/**
 * `<ComparativoTexto>` — comparação textual em valor absoluto (CON-UX-02).
 *
 * Spec: docs/ux/wireframes/06-componentes-criticos.md §3.
 *
 * Crítico: `sentiment` é independente do sinal de `delta`. Despesa que cai
 * tem `delta < 0` mas `sentiment: 'positive'` — quem chama decide o significado.
 */
export interface ComparativoTextoProps {
  /** Delta em centavos (pode ser negativo). */
  delta: number;
  /** Período de referência: "março", "mês passado", "ano passado". */
  period: string;
  sentiment: 'positive' | 'negative' | 'neutral';
  /** `full` = "R$ 2.300 a mais que março" · `compact` = "↑ R$ 2.300". */
  format?: 'full' | 'compact';
  className?: string;
}

const SENTIMENT_CLASS: Record<ComparativoTextoProps['sentiment'], string> = {
  positive: 'text-lucro',
  negative: 'text-prejuizo',
  neutral: 'text-muted-foreground',
};

export function ComparativoTexto({
  delta,
  period,
  sentiment,
  format = 'full',
  className,
}: ComparativoTextoProps) {
  const isUp = delta >= 0;
  const Icon = isUp ? TrendingUp : TrendingDown;
  const absoluteValue = formatCentsBRL(Math.abs(delta));
  const direction = isUp ? 'a mais' : 'a menos';
  const srDirection = isUp ? 'aumento de' : 'redução de';

  return (
    <span
      className={cn('inline-flex items-center gap-1.5 text-sm', SENTIMENT_CLASS[sentiment], className)}
    >
      <Icon className="h-4 w-4" aria-hidden="true" />
      <span className="sr-only">{srDirection}</span>
      <span className="font-medium tabular-nums">{absoluteValue}</span>
      {format === 'full' && (
        <span className="font-normal text-muted-foreground">
          {direction} que {period}
        </span>
      )}
    </span>
  );
}
