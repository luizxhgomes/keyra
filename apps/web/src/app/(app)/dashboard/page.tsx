import { Card, CardContent } from '@/components/ui/card';
import { ErrorMessage, KPICard } from '@/components/keyra';
import { buildComparativo } from '@/lib/financeiro/comparativo';

import { getDashboardKpis } from './actions';
import { AgendaHojeCard } from './agenda-hoje-card';
import { AlertasCard } from './alertas-card';
import { IndicadoresCard } from './indicadores-card';
import { MetaCard } from './meta-card';

/**
 * Story 4.4 — Dashboard tela única.
 *
 * Server Component. KPIs reais via `v_dashboard_kpis` + comparativo
 * absoluto vs mês passado (Story 4.7). Slots para 4.5-4.9 ficam como
 * placeholders enquanto stories irmãs não chegam — mantêm a estrutura
 * viva sem bloquear esta entrega.
 */
export default async function DashboardPage() {
  const result = await getDashboardKpis();

  if (!result.ok) {
    return (
      <div className="flex flex-col gap-6">
        <header>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Dashboard</h1>
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

  const noData =
    k.revenueMtdCents === 0 &&
    k.expensesMtdCents === 0 &&
    k.expectedRevenueMtdCents === 0 &&
    k.appointmentsToday === 0;

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Visão única do seu mês — números absolutos, sem gráfico.
        </p>
      </header>

      {noData ? (
        <Card>
          <CardContent className="py-6">
            <p className="text-sm text-muted-foreground">
              <strong>Conclua atendimentos e registre pagamentos</strong> para ver os
              números aparecerem aqui. O dashboard mostra receita realizada, despesas
              e lucro do mês corrente em tempo real, conforme a operação acontece.
            </p>
          </CardContent>
        </Card>
      ) : null}

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

      <AlertasCard />

      <section className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <AgendaHojeCard />
        <IndicadoresCard />
      </section>

      <MetaCard />
    </div>
  );
}
