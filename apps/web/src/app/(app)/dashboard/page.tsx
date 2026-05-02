import { Card, CardContent } from '@/components/ui/card';
import { EmptyState, ErrorMessage, KPICard } from '@/components/keyra';
import { Sparkles } from 'lucide-react';
import { buildComparativo } from '@/lib/financeiro/comparativo';
import { ScrollFadeRise } from '@/lib/motion/scroll-fade-rise';

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
 *
 * **Ordem dos elementos (Story 6.0 / decisão da idealizadora):**
 * 1. KPIs hero (Receita realizada, Receita prevista, Despesas, Lucro) —
 *    indicadores agregados que comunicam saúde do mês em 1 olhada.
 * 2. AlertasCard — sinais que merecem atenção; aparece com empty state
 *    positivo quando não há alertas (Story 5.7).
 * 3. Grid 2 cols: AgendaHojeCard + IndicadoresCard — segundo nível de
 *    leitura, detalhamento operacional do dia.
 * 4. MetaCard — progressão da meta do mês.
 *
 * AgendaHojeCard é **lista detalhada** (horários do dia), não **KPI agregado**
 * (número absoluto único). Por isso fica abaixo dos KPIs hero. Decisão
 * registrada após auditoria `@baziotti` 2026-05-02 questionar a ordem.
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
            <EmptyState
              icon={Sparkles}
              title="Conclua atendimentos para ver os números"
              description="O dashboard mostra receita realizada, despesas e lucro do mês corrente em tempo real, conforme você marca atendimentos como concluídos e registra pagamentos."
            />
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

      {/* Story 6.2 (AC2.9) — cards abaixo do fold entram com fadeRise
          quando entram no viewport (`once: true` para não re-animar). */}
      <ScrollFadeRise>
        <AlertasCard />
      </ScrollFadeRise>

      <section className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <ScrollFadeRise>
          <AgendaHojeCard />
        </ScrollFadeRise>
        <ScrollFadeRise>
          <IndicadoresCard />
        </ScrollFadeRise>
      </section>

      <ScrollFadeRise>
        <MetaCard />
      </ScrollFadeRise>
    </div>
  );
}
