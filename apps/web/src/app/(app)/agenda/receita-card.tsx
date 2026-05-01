import { formatBRL } from '@/lib/money';

import { getReceitaPrevista } from './actions';

/**
 * Card sticky de receita prevista (Story 2.7).
 *
 * Server Component — `getReceitaPrevista()` é chamado direto no render.
 * Atualização "automática" do card vem do `revalidatePath('/agenda')` que
 * `createAppointment` (Story 2.5) e `changeAppointmentStatus` (Story 2.6)
 * já fazem após qualquer mutação. Sem polling, sem websocket.
 *
 * UX (princípios da idealizadora):
 * - Números absolutos em pt-BR via `formatBRL` (Decimal.js + ROUND_HALF_EVEN).
 * - Sem gráficos. Sem percentuais. Apenas hoje · semana · mês.
 * - Empty state = `R$ 0,00` (a view só agrega `scheduled`, então quando
 *   nada está marcado o `getReceitaPrevista` devolve "0.00" e o `formatBRL`
 *   renderiza `R$ 0,00` — sem traços nem placeholder, conforme DoD §3).
 */
export async function ReceitaCard() {
  const receita = await getReceitaPrevista();

  return (
    <section
      aria-label="Receita prevista"
      className="sticky top-0 z-10 -mx-4 -mt-4 border-b border-border bg-card/95 px-4 py-3 backdrop-blur sm:-mx-6 sm:-mt-6 sm:px-6"
    >
      <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        Receita prevista
      </h2>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <ValueCell label="Hoje" value={receita.today} />
        <ValueCell label="Esta semana" value={receita.week} />
        <ValueCell label="Este mês" value={receita.month} />
      </div>
    </section>
  );
}

function ValueCell({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-xs uppercase tracking-wide text-muted-foreground">
        {label}
      </span>
      <span className="text-xl font-semibold tabular-nums text-foreground">
        {formatBRL(value)}
      </span>
    </div>
  );
}
