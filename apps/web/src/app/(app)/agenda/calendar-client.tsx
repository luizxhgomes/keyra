'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import FullCalendar from '@fullcalendar/react';
import timeGridPlugin from '@fullcalendar/timegrid';
import ptBrLocale from '@fullcalendar/core/locales/pt-br';
import type {
  EventClickArg,
  EventInput,
  EventSourceFuncArg,
} from '@fullcalendar/core';

import {
  listAppointments,
  type AgendaEvent,
  type AgendaPickerCustomer,
  type AgendaPickerProfessional,
  type AgendaPickerService,
  type AgendaProfessional,
} from './actions';
import { AlertCard } from '@/components/keyra';

import {
  AgendaToolbar,
  type AgendaStatusFilter,
  type AgendaView,
} from './agenda-toolbar';
import { AgendamentoForm } from './agendamento-form';
import { EventDetailSheet } from './event-detail-sheet';
import { MiniCalendarSide } from './mini-calendar-side';

type Props = {
  professionals: AgendaProfessional[];
  pickers: {
    customers: AgendaPickerCustomer[];
    services: AgendaPickerService[];
    professionals: AgendaPickerProfessional[];
  };
  initialProfessionalId: string | null;
};

/**
 * Calendar client da Agenda.
 *
 * Refinamento Fase 1 (2026-05-08):
 * - Layout 2-col com sidebar lateral (mini-cal + counts + próximo agendamento)
 * - Filtro de status (tabs no toolbar)
 * - Search textual (cliente/serviço/profissional)
 * - Mantém TODA arquitetura existente: FullCalendar v6, EventDetailSheet,
 *   AgendamentoForm, cancel dialog, ReceitaCard.
 *
 * Não muda comportamento legado:
 * - 3 views (Day/Week/Month), pt-BR, firstDay=1, mobile=Day
 * - Cap 200 eventos com warning AlertCard
 * - Filtro por profissional (Select)
 * - Click slot vazio → abre formulário
 * - Click evento → abre drawer
 */
export function CalendarClient({ professionals, pickers, initialProfessionalId }: Props) {
  const calendarRef = useRef<FullCalendar | null>(null);
  const eventsRef = useRef<Map<string, AgendaEvent>>(new Map());
  const router = useRouter();
  const searchParams = useSearchParams();
  const novoParam = searchParams?.get('novo') === '1';

  const [view, setView] = useState<AgendaView>('timeGridWeek');
  const [title, setTitle] = useState('');
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [selectedEvent, setSelectedEvent] = useState<AgendaEvent | null>(null);
  const [selectedProfessionalId, setSelectedProfessionalId] = useState<string | null>(
    initialProfessionalId,
  );
  const [statusFilter, setStatusFilter] = useState<AgendaStatusFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [truncated, setTruncated] = useState(false);

  // Story 2.5 + 5.7 — formulário de novo agendamento.
  const [formOpen, setFormOpen] = useState(false);
  const [formInitialStartsAt, setFormInitialStartsAt] = useState<Date | null>(null);
  const [prevNovoParam, setPrevNovoParam] = useState(false);
  if (prevNovoParam !== novoParam) {
    setPrevNovoParam(novoParam);
    if (novoParam) {
      setFormInitialStartsAt(null);
      setFormOpen(true);
    }
  }

  // Mobile default = day view (AC1.1).
  useEffect(() => {
    if (typeof window !== 'undefined' && window.matchMedia('(max-width: 640px)').matches) {
      calendarRef.current?.getApi().changeView('timeGridDay');
    }
  }, []);

  // Refetch quando qualquer filtro muda.
  useEffect(() => {
    calendarRef.current?.getApi().refetchEvents();
  }, [selectedProfessionalId, statusFilter, searchQuery]);

  const handleViewChange = useCallback((next: AgendaView) => {
    setView(next);
    calendarRef.current?.getApi().changeView(next);
  }, []);

  const handlePrev = useCallback(() => calendarRef.current?.getApi().prev(), []);
  const handleNext = useCallback(() => calendarRef.current?.getApi().next(), []);
  const handleToday = useCallback(() => calendarRef.current?.getApi().today(), []);

  // Mini-cal: clicar num dia navega o FullCalendar para esse dia.
  const handleSelectDayFromMini = useCallback((date: Date) => {
    const api = calendarRef.current?.getApi();
    if (!api) return;
    api.gotoDate(date);
    api.changeView('timeGridDay');
  }, []);

  const handleEventClick = useCallback((arg: EventClickArg) => {
    const cached = eventsRef.current.get(arg.event.id);
    if (cached) setSelectedEvent(cached);
  }, []);

  const handleNewAppointment = useCallback(() => {
    setFormInitialStartsAt(null);
    setFormOpen(true);
  }, []);

  const handleSlotClick = useCallback((arg: { date: Date }) => {
    setFormInitialStartsAt(arg.date);
    setFormOpen(true);
  }, []);

  const handleAppointmentCreated = useCallback(() => {
    calendarRef.current?.getApi().refetchEvents();
  }, []);

  const handleFormOpenChange = useCallback(
    (open: boolean) => {
      setFormOpen(open);
      if (!open && novoParam) {
        const next = new URLSearchParams(searchParams?.toString() ?? '');
        next.delete('novo');
        const query = next.toString();
        router.replace(`/agenda${query ? `?${query}` : ''}`, { scroll: false });
      }
    },
    [novoParam, router, searchParams],
  );

  const fetchEvents = useCallback(
    async (
      info: EventSourceFuncArg,
      success: (events: EventInput[]) => void,
      failure: (err: Error) => void,
    ) => {
      try {
        const statusIn =
          statusFilter === 'all'
            ? undefined
            : ([statusFilter] as Array<'scheduled' | 'done' | 'cancelled' | 'no_show'>);
        const result = await listAppointments({
          start: info.startStr,
          end: info.endStr,
          ...(selectedProfessionalId ? { professionalId: selectedProfessionalId } : {}),
          ...(statusIn ? { statusIn } : {}),
          ...(searchQuery.trim() ? { search: searchQuery.trim() } : {}),
        });
        setTruncated(result.truncated);

        eventsRef.current.clear();
        for (const evt of result.events) eventsRef.current.set(evt.id, evt);

        success(
          result.events.map<EventInput>((e) => ({
            id: e.id,
            title: e.title,
            start: e.start,
            end: e.end,
            ...(e.color ? { backgroundColor: e.color, borderColor: e.color } : {}),
            classNames: [
              'keyra-event',
              `keyra-event-${e.extendedProps.status}`,
            ],
            extendedProps: e.extendedProps as unknown as Record<string, unknown>,
          })),
        );
      } catch (err) {
        failure(err instanceof Error ? err : new Error(String(err)));
      }
    },
    [selectedProfessionalId, statusFilter, searchQuery],
  );

  return (
    <div className="flex flex-1 flex-col gap-4 lg:flex-row">
      {/* Sidebar lateral — mini-cal + counts + próximo agendamento */}
      <aside className="lg:w-72 lg:shrink-0">
        <MiniCalendarSide
          currentDate={currentDate}
          onSelectDay={handleSelectDayFromMini}
          professionalId={selectedProfessionalId}
        />
      </aside>

      {/* Coluna principal — toolbar + calendário */}
      <div className="flex min-w-0 flex-1 flex-col gap-3">
        <AgendaToolbar
          view={view}
          onViewChange={handleViewChange}
          onPrev={handlePrev}
          onNext={handleNext}
          onToday={handleToday}
          title={title}
          professionals={professionals}
          selectedProfessionalId={selectedProfessionalId}
          onProfessionalChange={setSelectedProfessionalId}
          onNewAppointment={handleNewAppointment}
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />

        {truncated ? (
          <AlertCard
            severity="warning"
            title="Período com muitos agendamentos"
            subtitle="Mais de 200 eventos neste intervalo. Refine o filtro de profissional ou diminua a faixa de datas para ver todos."
          />
        ) : null}

        <div className="flex-1 overflow-x-auto rounded-lg border border-border bg-card p-2 shadow-warm-sm">
          <FullCalendar
            ref={calendarRef}
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
            initialView={view}
            headerToolbar={false}
            locale={ptBrLocale}
            height="auto"
            slotMinTime="06:00:00"
            slotMaxTime="22:00:00"
            allDaySlot={false}
            firstDay={1}
            nowIndicator
            events={fetchEvents}
            eventClick={handleEventClick}
            dateClick={handleSlotClick}
            datesSet={(arg) => {
              setTitle(arg.view.title);
              setView(arg.view.type as AgendaView);
              setCurrentDate(arg.view.currentStart);
            }}
            dayMaxEventRows={3}
            eventDisplay="block"
          />
        </div>
      </div>

      <EventDetailSheet
        event={selectedEvent}
        onOpenChange={(open) => !open && setSelectedEvent(null)}
        onChanged={() => calendarRef.current?.getApi().refetchEvents()}
      />

      <AgendamentoForm
        open={formOpen}
        onOpenChange={handleFormOpenChange}
        pickers={pickers}
        initialStartsAt={formInitialStartsAt}
        initialProfessionalId={selectedProfessionalId}
        onCreated={handleAppointmentCreated}
      />
    </div>
  );
}
