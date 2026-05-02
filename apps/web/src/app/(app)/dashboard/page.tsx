import { Card, CardContent } from '@/components/ui/card';
import { ErrorMessage, KPICard } from '@/components/keyra';
import { Sparkles } from 'lucide-react';
import { buildComparativo } from '@/lib/financeiro/comparativo';

import { getDashboardKpis } from './actions';
import { AgendaHojeCard } from './agenda-hoje-card';
import { AlertasCard } from './alertas-card';
import { IndicadoresCard } from './indicadores-card';
import { MetaCard } from './meta-card';

/**
 * Story 4.4 — Dashboard tela única (restaurado pós-HOTFIX 2026-05-02).
 *
 * Pós-HOTFIX:
 * - `ScrollFadeRise` removido (motion volta em story dedicada com pattern
 *   correto pra hidratação Next 16).
 * - `EmptyState` (no-data branch) substituído por `InlineEmptyState` (Server-safe
 *   sem motion).
 * - `useDismissedAlerts` (em AlertasList) reescrito sem `useSyncExternalStore`.
 *
 * Server Component. KPIs reais via `v_dashboard_kpis` + comparativo absoluto
 * vs mês passado (Story 4.7). Cards filhos: AlertasCard, AgendaHojeCard,
 * IndicadoresCard, MetaCard.
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

  const noData =
    k.revenueMtdCents === 0 &&
    k.expensesMtdCents === 0 &&
    k.expectedRevenueMtdCents === 0 &&
    k.appointmentsToday === 0;

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-1">
        <h1 className="text-display-hero text-foreground">Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Visão única do seu mês — números absolutos, sem gráfico.
        </p>
      </header>

      {noData ? (
        <Card>
          <CardContent className="py-6">
            <NoDataInline />
          </CardContent>
        </Card>
      ) : null}

      <section
        aria-label="Indicadores financeiros do mês"
        className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"
      >
        <KPICard
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

/**
 * Empty state inline (Server-safe) para o "noData" branch.
 * Substitui import do `<EmptyState>` global, evitando passar Lucide
 * `Sparkles` (forwardRef) através de fronteira RSC.
 */
function NoDataInline() {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-12 text-center">
      <div className="mb-1 rounded-full bg-muted p-3">
        <Sparkles
          className="h-6 w-6 text-muted-foreground"
          strokeWidth={1.5}
          aria-hidden="true"
        />
      </div>
      <h3 className="text-base font-semibold tracking-tight text-foreground">
        Conclua atendimentos para ver os números
      </h3>
      <p className="max-w-sm text-sm text-muted-foreground">
        O dashboard mostra receita realizada, despesas e lucro do mês corrente em tempo real, conforme você marca atendimentos como concluídos e registra pagamentos.
      </p>
    </div>
  );
}
