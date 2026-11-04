import Decimal from 'decimal.js';

/**
 * Story 4.10 — helpers puros do "comparativo justo".
 *
 * A janela (dia 1 até hoje × mesmo intervalo do mês anterior) é calculada no
 * banco por `dashboard_period_comparison()`, em America/Sao_Paulo. Aqui só
 * formatamos as datas devolvidas e fazemos as contas derivadas, sem `Number`
 * para dinheiro (invariante 3 do AGENTS.md).
 */

const MESES = [
  'janeiro',
  'fevereiro',
  'março',
  'abril',
  'maio',
  'junho',
  'julho',
  'agosto',
  'setembro',
  'outubro',
  'novembro',
  'dezembro',
] as const;

/** Lê `YYYY-MM-DD` sem passar por `Date` (evita deslocamento de fuso). */
function parseIsoDate(iso: string): { day: number; month: number } {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!match) throw new Error(`Data inválida: ${iso}`);
  return { month: Number(match[2]), day: Number(match[3]) };
}

/**
 * Texto do período anterior para o `ComparativoTexto`, que renderiza
 * "`R$ X a mais que {period}`".
 *
 * - `2026-10-01` a `2026-10-04` → "de 1 a 4 de outubro"
 * - `2026-10-01` a `2026-10-01` → "em 1º de outubro"
 */
export function formatPeriodoComparado(startIso: string, endIso: string): string {
  const start = parseIsoDate(startIso);
  const end = parseIsoDate(endIso);
  const mes = MESES[end.month - 1];
  if (!mes) throw new Error(`Mês inválido: ${endIso}`);
  if (start.day === end.day && start.month === end.month) {
    return `em ${start.day === 1 ? '1º' : start.day} de ${mes}`;
  }
  return `de ${start.day} a ${end.day} de ${mes}`;
}

/** Ticket médio em centavos, arredondado com ROUND_HALF_EVEN. */
export function ticketMedioCents(totalCents: number, quantidade: number): number {
  if (quantidade <= 0) return 0;
  return new Decimal(totalCents)
    .dividedBy(quantidade)
    .toDecimalPlaces(0, Decimal.ROUND_HALF_EVEN)
    .toNumber();
}

/** Taxa de comparecimento em % (done ÷ fechados). Zero sem atendimentos fechados. */
export function taxaComparecimento(realizados: number, fechados: number): number {
  if (fechados <= 0) return 0;
  return new Decimal(realizados).dividedBy(fechados).times(100).toNumber();
}
