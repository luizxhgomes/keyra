/**
 * Story 4.7 — helper de comparativo textual.
 *
 * Centraliza a decisão UX inegociável: comparativos sempre absolutos, sem
 * percentual, sem ícone de seta visualmente dominante. O componente
 * `<ComparativoTexto>` (`components/keyra/`) consome este helper.
 *
 * `sentiment` é independente do sinal de delta — receita caindo é
 * `negative`, despesa caindo é `positive`. Quem chama decide o significado.
 */
export type Sentiment = 'positive' | 'negative' | 'neutral';

export interface ComparativoData {
  /** Delta em centavos. Casa com a API do `<ComparativoTexto>`. */
  delta: number;
  /** Período de referência (ex: "março"). */
  period: string;
  /** Significado do delta para a UI (cor). */
  sentiment: Sentiment;
}

/**
 * Calcula sentiment para uma métrica em que "valor maior = melhor"
 * (revenue, profit, appointments_done).
 */
export function deltaSentimentRevenue(
  currentCents: number,
  previousCents: number,
): Sentiment {
  if (currentCents === previousCents) return 'neutral';
  return currentCents > previousCents ? 'positive' : 'negative';
}

/**
 * Calcula sentiment para uma métrica em que "valor menor = melhor"
 * (expenses, no_show_rate, fees).
 */
export function deltaSentimentExpense(
  currentCents: number,
  previousCents: number,
): Sentiment {
  if (currentCents === previousCents) return 'neutral';
  return currentCents < previousCents ? 'positive' : 'negative';
}

export function buildComparativo(
  currentCents: number,
  previousCents: number,
  period: string,
  metric: 'revenue' | 'expense',
): ComparativoData | null {
  // Sem histórico do período de referência → sem comparativo (mostra "—" no UI).
  if (previousCents === 0 && currentCents === 0) return null;
  return {
    delta: currentCents - previousCents,
    period,
    sentiment:
      metric === 'revenue'
        ? deltaSentimentRevenue(currentCents, previousCents)
        : deltaSentimentExpense(currentCents, previousCents),
  };
}
