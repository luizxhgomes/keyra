'use client';

import { BellOff, CheckCircle2 } from 'lucide-react';

import { AlertCard, EmptyState } from '@/components/keyra';
import { useDismissedAlerts } from '@/lib/hooks/use-dismissed-alerts';

import type { Alert } from './actions';

/**
 * `<AlertasList>` (Story 6.3 — Client Component) — renderiza a lista de
 * alertas do dashboard usando `<AlertCard>` como fonte única.
 *
 * Responsabilidades:
 * - Filtrar alertas silenciados (via `useDismissedAlerts` — SSR-safe).
 * - Aplicar cap 3+5+5 por severity (defensivo para Phase 5; com 4 regras
 *   atuais o cap nunca é atingido em produção, mas estrutura existe).
 * - Renderizar empty state com 2 variações: positiva (`CheckCircle2` —
 *   herdada da Story 5.7) e neutra (`BellOff` — novo, para "tudo silenciado").
 * - Botão "Silenciar 7 dias" via `secondaryAction` do `<AlertCard>`,
 *   omitido em `severity === 'critical'` (perda de risco proibida).
 */

const CAPS: Record<Alert['severity'], number> = {
  critical: 3,
  warning: 5,
  info: 5,
};

const SEVERITY_ORDER: Alert['severity'][] = ['critical', 'warning', 'info'];

interface AlertasListProps {
  alerts: Alert[];
  orgId: string;
}

export function AlertasList({ alerts, orgId }: AlertasListProps) {
  const { dismiss, isDismissed } = useDismissedAlerts(orgId);

  // 1. Filtrar alertas silenciados.
  const activeAlerts = alerts.filter((a) => !isDismissed(a.id));

  // 2. Aplicar cap 3+5+5 por severity. Estrutura imutável (reduce) para
  //    compatibilidade com React Compiler — sem mutação após render.
  const { capped, truncated } = SEVERITY_ORDER.reduce<{
    capped: Alert[];
    truncated: number;
  }>(
    (acc, sev) => {
      const ofSeverity = activeAlerts.filter((a) => a.severity === sev);
      return {
        capped: [...acc.capped, ...ofSeverity.slice(0, CAPS[sev])],
        truncated: acc.truncated + Math.max(0, ofSeverity.length - CAPS[sev]),
      };
    },
    { capped: [], truncated: 0 },
  );

  // 3. Empty state — duas variações.
  if (capped.length === 0) {
    const dismissedCount = alerts.length - activeAlerts.length;
    if (dismissedCount > 0) {
      return (
        <EmptyState
          icon={BellOff}
          title={`${dismissedCount} ${
            dismissedCount === 1 ? 'alerta silenciado' : 'alertas silenciados'
          } nesta semana`}
          description="Você silenciou todos os alertas ativos. Eles voltam automaticamente após 7 dias se a condição persistir."
        />
      );
    }
    // Empty state positivo (preservado da Story 5.7).
    return (
      <EmptyState
        icon={CheckCircle2}
        title="Nenhum alerta esta semana"
        description="Sua operação está sob controle. Quando margem cair, falta subir ou estoque baixar, você vê aqui."
      />
    );
  }

  return (
    <div>
      <ul className="space-y-stack-loose">
        {capped.map((a) => (
          <li key={a.id}>
            <AlertCard
              severity={a.severity}
              title={a.title}
              subtitle={a.description}
              action={{ label: 'Investigar', href: a.href }}
              {...(a.severity !== 'critical'
                ? {
                    secondaryAction: {
                      label: 'Silenciar 7 dias',
                      onClick: () => dismiss(a.id),
                    },
                  }
                : {})}
            />
          </li>
        ))}
      </ul>
      {truncated > 0 ? (
        <p className="mt-stack text-xs text-muted-foreground">
          Mais {truncated} {truncated === 1 ? 'alerta silenciado' : 'alertas silenciados'} pelo
          limite (3 críticos · 5 avisos · 5 informativos).
        </p>
      ) : null}
    </div>
  );
}
