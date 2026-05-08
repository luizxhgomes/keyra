import { getReceitaPrevista } from './actions';
import { ReceitaCardAnimated } from './receita-card-animated';

/**
 * Card de receita prevista — Server Component que busca dados e delega
 * renderização animada ao Client wrapper `ReceitaCardAnimated`.
 *
 * Refinamento Fase 1 (2026-05-08):
 * - Removido pattern sticky com negative margins que causava overlap com
 *   o título "Agenda" em Fraunces grande
 * - Cards individuais com tipografia editorial (Fraunces) + ícones por bucket
 * - Animação stagger 80ms via motion tokens KEYRA (kpiRevealContainer)
 * - Labels temporais correlacionados à data atual do usuário (pt-BR)
 *
 * UX (princípios da idealizadora):
 * - Números absolutos em pt-BR via `formatBRL` (Decimal.js + ROUND_HALF_EVEN)
 * - Cores KEYRA: amber/terracota/cocoa por bucket temporal
 * - Empty state = `R$ 0,00` (a view só agrega `scheduled`, então quando
 *   nada está marcado o `getReceitaPrevista` devolve "0.00").
 *
 * Atualização "automática" do card vem do `revalidatePath('/agenda')` que
 * `createAppointment` (Story 2.5) e `changeAppointmentStatus` (Story 2.6)
 * já fazem após qualquer mutação. Sem polling, sem websocket.
 */
export async function ReceitaCard() {
  const receita = await getReceitaPrevista();

  return (
    <ReceitaCardAnimated
      today={receita.today}
      week={receita.week}
      month={receita.month}
      todayLabel={receita.todayLabel}
      weekRangeLabel={receita.weekRangeLabel}
      monthLabel={receita.monthLabel}
    />
  );
}
