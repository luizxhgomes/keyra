import type { Metadata } from 'next';

import { requireAuth } from '@/lib/auth/require-auth';
import { requireRole } from '@/lib/auth/roles';

import { listAgendaPickers, listAgendaProfessionals } from './actions';
import { CalendarClient } from './calendar-client';
import { ReceitaCard } from './receita-card';

export const metadata: Metadata = {
  title: 'Agenda',
  description: 'Visualização da agenda em dia, semana ou mês.',
};

type AgendaPageProps = {
  searchParams: Promise<{ professional?: string }>;
};

/**
 * Server shell da Agenda. Faz auth + role gate (`viewer` mínimo) e busca a
 * lista de profissionais ativos. O calendário em si é Client Component
 * (FullCalendar precisa de DOM); a navegação por data e o refetch dos eventos
 * acontecem direto no client via Server Action `listAppointments`.
 *
 * Story 2.4 — Agenda (visualização). Stories 2.5 (criar), 2.6 (status) e
 * 2.7 (receita prevista) penduram nas hooks expostas pelo `CalendarClient`.
 */
export default async function AgendaPage({ searchParams }: AgendaPageProps) {
  const { orgId } = await requireAuth();
  await requireRole(orgId, 'viewer');

  const [professionals, pickers] = await Promise.all([
    listAgendaProfessionals(),
    listAgendaPickers(),
  ]);
  const sp = await searchParams;
  const selectedProfessionalId =
    sp.professional && professionals.some((p) => p.id === sp.professional)
      ? sp.professional
      : null;

  return (
    <div className="flex h-full flex-col gap-4">
      <ReceitaCard />

      <header className="flex flex-col gap-1">
        <h1 className="text-display text-foreground">Agenda</h1>
        <p className="text-sm text-muted-foreground">
          Visualize agendamentos por dia, semana ou mês. Clique em um evento para
          ver detalhes.
        </p>
      </header>

      <CalendarClient
        professionals={professionals}
        pickers={pickers}
        initialProfessionalId={selectedProfessionalId}
      />
    </div>
  );
}
