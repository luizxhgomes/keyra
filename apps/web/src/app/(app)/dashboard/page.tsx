import { Card, CardContent } from '@/components/ui/card';
import { ErrorMessage } from '@/components/keyra';
import { Sparkles } from 'lucide-react';
import { buildComparativo } from '@/lib/financeiro/comparativo';
import { getCurrentUserDisplayName } from '@/lib/auth/get-current-user';

import { getDashboardKpis, getExpensesByCategoryThisMonth } from './actions';
import { AgendaHojeCard } from './agenda-hoje-card';
import { AlertasCard } from './alertas-card';
import { IndicadoresCard } from './indicadores-card';
import { MetaCard } from './meta-card';
import { DashboardHero } from './dashboard-hero';
import { KPICardActions } from './kpi-card-actions';
import { MonthScheduleCard } from './month-schedule-card';
import { TopServicesCard } from './top-services-card';
import { MajorExpensesCard } from './major-expenses-card';
import { DREProportionalCard } from './dre-proportional-card';
import { UpgradeCTACard } from './upgrade-cta-card';

/**
 * Dashboard editorial KEYRA — versão inspirada em referência fornecida pela
 * idealizadora (2026-05-07). Layout adaptado para Editorial Beauty Luxury:
 *
 * - Saudação editorial em Fraunces (dashboard-hero)
 * - 3 KPIs hero com pill buttons inline (kpi-card-actions)
 * - Calendário do mês com heatmap de agendamentos (month-schedule-card)
 * - DRE proporcional segmentado (dre-proportional-card)
 * - Top serviços com avatares (top-services-card)
 * - Despesas por categoria com mini-bars (major-expenses-card)
 * - CTA cocoa de upgrade (upgrade-cta-card)
 *
 * Cards legados preservados na parte inferior (Alertas, Agenda Hoje,
 * Indicadores, Meta) — nada foi removido.
 *
 * Princípio UX atualizado (feedback 2026-05-07): tabelas e gráficos
 * proporcionais permitidos como reforço, desde que números absolutos
 * continuem como herói visual.
 */
export default async function DashboardPage() {
  const [kpisResult, expensesResult, displayName] = await Promise.all([
    getDashboardKpis(),
    getExpensesByCategoryThisMonth(),
    getCurrentUserDisplayName(),
  ]);

  if (!kpisResult.ok) {
    return (
      <div className="flex flex-col gap-6">
        <DashboardHero displayName={displayName} />
        <Card>
          <CardContent className="py-6">
            <ErrorMessage detail={kpisResult.error} />
          </CardContent>
        </Card>
      </div>
    );
  }

  const k = kpisResult.data;
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
    <div className="flex flex-col gap-page">
      <DashboardHero
        displayName={displayName}
        subtitle="Visão única do seu mês — números absolutos primeiro, proporções como reforço."
      />

      {noData ? (
        <Card>
          <CardContent className="py-6">
            <NoDataInline />
          </CardContent>
        </Card>
      ) : null}

      {/* ─── Grid editorial unificado (4 cols xl) — casa com referência ─── */}
      <section
        aria-label="Painel financeiro do mês"
        className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:auto-rows-fr xl:grid-cols-4"
      >
        {/* Row 1 — 3 KPIs hero + Schedule (rowspan 2) */}
        <KPICardActions
          label="Receita do mês"
          value={k.revenueMtdCents}
          variant="hero"
          {...(revenueComp ? { comparison: revenueComp } : {})}
          actions={[
            { label: 'Lançar', href: '/financeiro/lancar', variant: 'primary' },
            { label: 'Detalhes', href: '/financeiro/dre', variant: 'secondary' },
          ]}
        />
        <KPICardActions
          label="Despesas do mês"
          value={k.expensesMtdCents}
          variant="hero"
          {...(expensesComp ? { comparison: expensesComp } : {})}
          actions={[
            { label: 'Lançar', href: '/financeiro/despesas/nova', variant: 'primary' },
            { label: 'Categorias', href: '/financeiro/categorias', variant: 'secondary' },
          ]}
        />
        <KPICardActions
          label="Lucro do mês"
          value={k.profitMtdCents}
          variant="hero"
          {...(profitComp ? { comparison: profitComp } : {})}
          actions={[
            { label: 'DRE completo', href: '/financeiro/dre', variant: 'primary' },
            { label: 'Por serviço', href: '/financeiro/dre-por-servico', variant: 'secondary' },
          ]}
        />
        <div className="md:col-span-2 xl:col-span-1 xl:row-span-2">
          <MonthScheduleCard />
        </div>

        {/* Row 2 — DRE Proporcional ocupa 3 cols (Schedule continua à direita) */}
        <div className="md:col-span-2 xl:col-span-3">
          <DREProportionalCard
            revenueCents={k.revenueMtdCents}
            expensesCents={k.expensesMtdCents}
            profitCents={k.profitMtdCents}
          />
        </div>

        {/* Row 3 — Major Expenses (2) + Top Services (1) + CTA (1) */}
        <div className="md:col-span-2 xl:col-span-2">
          {expensesResult.ok ? (
            <MajorExpensesCard data={expensesResult.data} />
          ) : (
            <Card className="h-full">
              <CardContent className="py-6">
                <ErrorMessage detail={expensesResult.error} />
              </CardContent>
            </Card>
          )}
        </div>
        <TopServicesCard />
        <UpgradeCTACard />
      </section>

      {/* ─── Bloco 4: Cards legados preservados ────────────────────────── */}
      <AlertasCard />

      <section className="grid grid-cols-1 gap-section lg:grid-cols-2">
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
