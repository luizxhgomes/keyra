'use client';

import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import type { AgendaProfessional } from './actions';

export type AgendaView = 'timeGridDay' | 'timeGridWeek' | 'dayGridMonth';

type Props = {
  view: AgendaView;
  onViewChange: (next: AgendaView) => void;
  onPrev: () => void;
  onNext: () => void;
  onToday: () => void;
  title: string;
  professionals: AgendaProfessional[];
  selectedProfessionalId: string | null;
  onProfessionalChange: (id: string | null) => void;
  /** Story 2.5 — abre o formulário de novo agendamento. */
  onNewAppointment: () => void;
};

/**
 * Toolbar customizado da Agenda — substitui `headerToolbar` padrão do
 * FullCalendar para manter o visual alinhado ao design system KEYRA
 * (botões shadcn, paleta terracota).
 */
export function AgendaToolbar({
  view,
  onViewChange,
  onPrev,
  onNext,
  onToday,
  title,
  professionals,
  selectedProfessionalId,
  onProfessionalChange,
  onNewAppointment,
}: Props) {
  return (
    <div className="flex flex-col gap-3 rounded-lg border border-border bg-card p-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={onPrev}
          aria-label="Período anterior"
        >
          <ChevronLeft className="h-4 w-4" aria-hidden="true" />
        </Button>
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={onNext}
          aria-label="Próximo período"
        >
          <ChevronRight className="h-4 w-4" aria-hidden="true" />
        </Button>
        <Button type="button" variant="outline" onClick={onToday}>
          Hoje
        </Button>
        <h2 className="ml-2 text-base font-semibold capitalize text-foreground sm:text-lg">
          {title}
        </h2>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <Button
          type="button"
          variant="default"
          onClick={onNewAppointment}
          className="sm:order-last"
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          Novo agendamento
        </Button>

        <Select
          value={selectedProfessionalId ?? 'all'}
          onValueChange={(value) =>
            onProfessionalChange(value === 'all' ? null : value)
          }
        >
          <SelectTrigger className="w-full sm:w-56" aria-label="Filtrar por profissional">
            <SelectValue placeholder="Todos os profissionais" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os profissionais</SelectItem>
            {professionals.map((p) => (
              <SelectItem key={p.id} value={p.id}>
                {p.display_name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="flex rounded-md border border-border bg-background p-0.5">
          <ViewButton
            label="Dia"
            isActive={view === 'timeGridDay'}
            onClick={() => onViewChange('timeGridDay')}
          />
          <ViewButton
            label="Semana"
            isActive={view === 'timeGridWeek'}
            onClick={() => onViewChange('timeGridWeek')}
          />
          <ViewButton
            label="Mês"
            isActive={view === 'dayGridMonth'}
            onClick={() => onViewChange('dayGridMonth')}
          />
        </div>
      </div>
    </div>
  );
}

function ViewButton({
  label,
  isActive,
  onClick,
}: {
  label: string;
  isActive: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={isActive}
      className={[
        'rounded px-3 py-1.5 text-sm font-medium transition-colors',
        isActive
          ? 'bg-primary text-primary-foreground'
          : 'text-foreground hover:bg-muted',
      ].join(' ')}
    >
      {label}
    </button>
  );
}
