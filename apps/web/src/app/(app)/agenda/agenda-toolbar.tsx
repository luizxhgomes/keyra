'use client';

import { ChevronLeft, ChevronRight, Plus, Search, X } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

import type { AgendaProfessional, AgendaStatus } from './actions';

export type AgendaView = 'timeGridDay' | 'timeGridWeek' | 'dayGridMonth';

export type AgendaStatusFilter = 'all' | AgendaStatus;

const STATUS_TABS: { id: AgendaStatusFilter; label: string }[] = [
  { id: 'all', label: 'Todos' },
  { id: 'scheduled', label: 'Agendados' },
  { id: 'done', label: 'Concluídos' },
  { id: 'cancelled', label: 'Cancelados' },
  { id: 'no_show', label: 'Faltas' },
];

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
  /** Refinamento Fase 1 — filtro por status. */
  statusFilter: AgendaStatusFilter;
  onStatusFilterChange: (next: AgendaStatusFilter) => void;
  /** Refinamento Fase 1 — busca textual. */
  searchQuery: string;
  onSearchChange: (next: string) => void;
};

/**
 * Toolbar customizado da Agenda — substitui `headerToolbar` padrão do
 * FullCalendar para manter o visual alinhado ao design system KEYRA
 * (Editorial Beauty Luxury).
 *
 * Refinamento Fase 1 (2026-05-08):
 * - Tabs de filtro por status (Todos/Agendados/Concluídos/Cancelados/Faltas)
 * - Search bar para cliente/serviço/profissional
 * - View switcher em pills cocoa
 * - CTA "Novo agendamento" cocoa-900
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
  statusFilter,
  onStatusFilterChange,
  searchQuery,
  onSearchChange,
}: Props) {
  return (
    <div className="flex flex-col gap-3 rounded-lg border border-border bg-card p-3 shadow-warm-sm">
      {/* Linha 1: navegação + título + CTA novo agendamento */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
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
          <h2 className="ml-2 font-serif text-lg capitalize text-foreground sm:text-xl">
            {title}
          </h2>
        </div>

        <Button
          type="button"
          onClick={onNewAppointment}
          className="bg-cocoa-900 text-ivory-50 hover:bg-cocoa-800"
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          Novo agendamento
        </Button>
      </div>

      {/* Linha 2: Status tabs em segmented control com largura própria (sem
          competir por espaço com search/select/view). Em mobile vira full-width
          com scroll horizontal se necessário; em desktop ocupa apenas o que
          precisa pra exibir todos os labels sem truncar. */}
      <div
        role="tablist"
        aria-label="Filtrar por status"
        className="flex w-full overflow-x-auto rounded-full border border-mocha-300/40 bg-ivory-50 p-0.5 sm:w-fit"
      >
        {STATUS_TABS.map((tab) => {
          const active = statusFilter === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => onStatusFilterChange(tab.id)}
              className={cn(
                'flex-1 whitespace-nowrap rounded-full px-4 py-1.5 text-xs font-medium transition-all sm:flex-none',
                active
                  ? 'bg-cocoa-900 text-ivory-50 shadow-sm'
                  : 'text-cocoa-800 hover:bg-ivory-100',
              )}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Linha 3: Search ocupa o espaço restante; select profissional e view
          switcher ficam à direita. Em mobile, cada um em linha própria. */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <div className="relative w-full sm:flex-1">
          <Search
            className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
            strokeWidth={1.5}
            aria-hidden="true"
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Buscar cliente, serviço, profissional…"
            className="h-9 w-full rounded-full border border-mocha-300/40 bg-ivory-50 pl-9 pr-9 text-sm text-foreground placeholder:text-muted-foreground focus:border-cocoa-700/50 focus:outline-none focus:ring-2 focus:ring-cocoa-700/20"
            aria-label="Buscar agendamentos"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => onSearchChange('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              aria-label="Limpar busca"
            >
              <X className="h-3.5 w-3.5" strokeWidth={2} aria-hidden="true" />
            </button>
          )}
        </div>

        <Select
          value={selectedProfessionalId ?? 'all'}
          onValueChange={(value) =>
            onProfessionalChange(value === 'all' ? null : value)
          }
        >
          <SelectTrigger
            className="w-full sm:w-52"
            aria-label="Filtrar por profissional"
          >
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

        <div className="flex w-full rounded-full border border-mocha-300/40 bg-ivory-50 p-0.5 sm:w-auto">
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
      className={cn(
        'flex-1 whitespace-nowrap rounded-full px-3 py-1 text-xs font-medium transition-colors sm:flex-none',
        isActive
          ? 'bg-cocoa-900 text-ivory-50 shadow-sm'
          : 'text-cocoa-800 hover:bg-ivory-100',
      )}
    >
      {label}
    </button>
  );
}
