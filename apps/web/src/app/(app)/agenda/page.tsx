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
 * (FullCalendar precisa de DOM).
 *
 * Refinamento Fase 1 (2026-05-08): layout 2-col com sidebar lateral
 * (mini-calendário + counts mensais + próximo agendamento). Mobile mantém
 * empilhamento. Inspirado em referência fornecida pela idealizadora.
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
      <header className="flex flex-col gap-1">
        <h1 className="font-serif text-display text-foreground">Agenda</h1>
        <p className="text-sm text-muted-foreground">
          Visualize agendamentos por dia, semana ou mês. Clique em um evento para
          ver detalhes.
        </p>
      </header>

      <ReceitaCard />

      <CalendarClient
        professionals={professionals}
        pickers={pickers}
        initialProfessionalId={selectedProfessionalId}
      />
    </div>
  );
}
