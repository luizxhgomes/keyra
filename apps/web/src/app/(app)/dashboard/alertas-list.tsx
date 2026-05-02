'use client';

import { BellOff, CheckCircle2 } from 'lucide-react';

import { AlertCard } from '@/components/keyra';
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

  // 3. Empty state — duas variações (HOTFIX 2026-05-02: inlined para eliminar
  // import Client → Server proibido em Next 16. EmptyState ficou como Server
  // após fix do digest 3213099672 e este componente é Client).
  if (capped.length === 0) {
    const dismissedCount = alerts.length - activeAlerts.length;
    if (dismissedCount > 0) {
      return (
        <InlineEmptyState
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
      <InlineEmptyState
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

/**
 * Inline empty state — Client-only, sem dependência do `<EmptyState>` Server.
 * HOTFIX 2026-05-02: existe porque AlertasList é Client e Next 16 proíbe
 * Client → Server import direto. Cobre apenas os 2 casos do AlertasList
 * (BellOff e CheckCircle2). Visualmente equivalente ao EmptyState global
 * sem `action`/`hint` (não usados aqui).
 */
function InlineEmptyState({
  icon: Icon,
  title,
  description,
}: {
  icon: typeof BellOff;
  title: string;
  description: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-12 text-center">
      <div className="mb-1 rounded-full bg-muted p-3">
        <Icon
          className="h-6 w-6 text-muted-foreground"
          strokeWidth={1.5}
          aria-hidden="true"
        />
      </div>
      <h3 className="text-base font-semibold tracking-tight text-foreground">
        {title}
      </h3>
      <p className="max-w-sm text-sm text-muted-foreground">{description}</p>
    </div>
  );
}
