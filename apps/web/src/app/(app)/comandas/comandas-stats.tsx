'use client';

import { StatCard, StatCardsSection } from '@/components/keyra';
import { formatCentsBRL } from '@/lib/money';

interface Props {
  totalThisMonth: number;
  openCount: number;
  paidThisMonth: number;
  revenueThisMonthCents: number;
  totalLastMonth: number;
  openCountLastMonth: number;
  paidLastMonth: number;
  revenueLastMonthCents: number;
}

/**
 * 4 stats de atendimentos — piloto da unificação em `<StatCard>` canônico
 * (Story reorg.4). Visual idêntico ao anterior; a implementação duplicada
 * (Cell/DeltaPill/ACCENT_RING locais) migrou para `components/keyra/StatCard`.
 *
 * KPIs:
 * - Total do mês     (count comandas opened_at no mês)
 * - Em aberto        (status=open, count atual — não comparável MoM)
 * - Pagas no mês     (count comandas paid_at no mês)
 * - Faturamento mês  (sum total de comandas paid no mês)
 */
export function ComandasStats({
  totalThisMonth,
  openCount,
  paidThisMonth,
  revenueThisMonthCents,
  totalLastMonth,
  openCountLastMonth,
  paidLastMonth,
  revenueLastMonthCents,
}: Props) {
  return (
    <StatCardsSection ariaLabel="Resumo de atendimentos">
      <StatCard
        icon="receipt"
        label="Total do mês"
        value={totalThisMonth.toLocaleString('pt-BR')}
        delta={pctDelta(totalThisMonth, totalLastMonth)}
        accent="cocoa"
      />
      <StatCard
        icon="clock"
        label="Em aberto"
        value={openCount.toLocaleString('pt-BR')}
        delta={pctDelta(openCount, openCountLastMonth)}
        accent="amber"
        {...(openCount === 0 ? { helper: 'Nada pendente' } : {})}
      />
      <StatCard
        icon="check"
        label="Pagas no mês"
        value={paidThisMonth.toLocaleString('pt-BR')}
        delta={pctDelta(paidThisMonth, paidLastMonth)}
        accent="success"
      />
      <StatCard
        icon="money"
        label="Faturamento"
        value={formatCentsBRL(revenueThisMonthCents)}
        delta={pctDelta(revenueThisMonthCents, revenueLastMonthCents)}
        accent="terracota"
      />
    </StatCardsSection>
  );
}

function pctDelta(curr: number, past: number): number | null {
  if (past === 0) return curr > 0 ? 100 : null;
  return Math.round(((curr - past) / past) * 100);
}
