import { AlertCard, KPICard, StatusBadge } from '@/components/keyra';

/**
 * Dashboard placeholder — Story 1.1 scaffold.
 *
 * Story 4.4 implementa o dashboard real (tela única, KPIs absolutos,
 * comparativo textual, 1 gráfico permitido). Aqui mostramos os componentes
 * canônicos com dados mockados para validar o design system e os layouts.
 */
export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Visão única do seu mês — números absolutos, sem gráfico (CON-UX-01).
        </p>
      </header>

      {/* KPIs (mock data — Story 4.4 substitui por queries reais) */}
      <section
        aria-label="Indicadores financeiros"
        className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"
      >
        <KPICard
          variant="hero"
          label="Dinheiro que entrou este mês"
          value={2_475_000}
          comparison={{
            delta: 230_000,
            period: 'março',
            sentiment: 'positive',
          }}
          helper="em 47 atendimentos"
        />
        <KPICard
          label="Dinheiro a receber"
          value={812_500}
          helper="22 horários marcados"
        />
        <KPICard
          label="Despesas do mês"
          value={1_120_000}
          comparison={{
            delta: -43_000,
            period: 'março',
            sentiment: 'positive',
          }}
        />
        <KPICard
          label="Resultado do mês"
          value={1_355_000}
          comparison={{
            delta: 273_000,
            period: 'março',
            sentiment: 'positive',
          }}
        />
      </section>

      {/* Alerts */}
      <section aria-label="Alertas" className="grid grid-cols-1 gap-3 lg:grid-cols-2">
        <AlertCard
          severity="warning"
          title="3 clientes faltaram esta semana"
          subtitle="R$ 540 perdidos"
          action={{ label: 'Ver agenda', href: '/agenda' }}
        />
        <AlertCard
          severity="info"
          title="2 insumos com estoque baixo"
          subtitle="Ácido hialurônico, agulhas 30G"
          action={{ label: 'Ver estoque', href: '/estoque' }}
        />
      </section>

      {/* Status badges showcase */}
      <section aria-label="Próximos agendamentos" className="flex flex-col gap-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Próximos atendimentos (placeholder Story 1.1)
        </h2>
        <div className="flex flex-wrap gap-2">
          <StatusBadge status="agendado" />
          <StatusBadge status="realizado" />
          <StatusBadge status="cancelado" />
          <StatusBadge status="falta" />
          <StatusBadge status="aberta" />
          <StatusBadge status="finalizada" />
          <StatusBadge status="paga" />
        </div>
        <p className="text-xs text-muted-foreground">
          Lista real virá na Story 4.5 (Agenda do dia no dashboard).
        </p>
      </section>
    </div>
  );
}
