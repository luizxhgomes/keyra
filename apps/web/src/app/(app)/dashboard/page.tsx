import { Card, CardContent } from '@/components/ui/card';
import { ErrorMessage, KPICard } from '@/components/keyra';
import { buildComparativo } from '@/lib/financeiro/comparativo';

import { getDashboardKpis } from './actions';

/**
 * Story 4.4 — Dashboard tela única (HOTFIX 2026-05-02 BISECT).
 *
 * Versão MINIMAL para isolar bug de hidratação digest 3213099672.
 * Removidos temporariamente: AlertasCard, AgendaHojeCard, IndicadoresCard,
 * MetaCard, EmptyState (no-data branch). Mantidos apenas: 4 KPICard.
 *
 * Se esta versão carregar → bug está em algum dos cards removidos.
 * Se ainda quebrar → bug é no KPICard ou no shell mesmo.
 */
export default async function DashboardPage() {
  const result = await getDashboardKpis();

  if (!result.ok) {
    return (
      <div className="flex flex-col gap-6">
        <header>
          <h1 className="text-display-hero text-foreground">Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            Visão única do seu mês — números absolutos, sem gráfico.
          </p>
        </header>
        <Card>
          <CardContent className="py-6">
            <ErrorMessage detail={result.error} />
          </CardContent>
        </Card>
      </div>
    );
  }

  const k = result.data;
  const period = k.lastMonthLabel;

  const revenueComp = buildComparativo(
    k.revenueMtdCents,
    k.revenueLastMonthCents,
    period,
    'revenue',
  );
  const expensesComp = buildComparativo(
    k.expensesMtdCents,
    k.expensesLastMonthCents,
    period,
    'expense',
  );
  const profitComp = buildComparativo(
    k.profitMtdCents,
    k.profitLastMonthCents,
    period,
    'revenue',
  );

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-1">
        <h1 className="text-display-hero text-foreground">Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Visão única do seu mês — números absolutos, sem gráfico.
        </p>
      </header>

      <section
        aria-label="Indicadores financeiros do mês"
        className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"
      >
        <KPICard
          variant="hero"
          label="Receita realizada"
          value={k.revenueMtdCents}
          {...(revenueComp ? { comparison: revenueComp } : {})}
        />
        <KPICard
          label="Receita prevista"
          value={k.expectedRevenueMtdCents}
          helper="Agendamentos do mês ainda não concluídos"
        />
        <KPICard
          label="Despesas"
          value={k.expensesMtdCents}
          {...(expensesComp ? { comparison: expensesComp } : {})}
        />
        <KPICard
          label="Lucro do mês"
          value={k.profitMtdCents}
          {...(profitComp ? { comparison: profitComp } : {})}
        />
      </section>
    </div>
  );
}
