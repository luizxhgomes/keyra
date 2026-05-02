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

import { AgendaToolbar, type AgendaView } from './agenda-toolbar';
import { AgendamentoForm } from './agendamento-form';
import { EventDetailSheet } from './event-detail-sheet';

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
 * - FullCalendar v6 com plugins gratuitos: dayGrid (mês), timeGrid (dia/semana),
 *   interaction (click). `resource-timegrid` é premium e foi excluído do MVP;
 *   filtro por profissional usa Select no toolbar (AC1.4).
 * - Locale pt-br + `firstDay=1` (semana começa na segunda).
 * - Eventos são carregados via Server Action `listAppointments` (com cap de 200
 *   por range; banner exibido se truncar — AC4 + Dev Notes).
 * - Sem timezone plugin: FullCalendar usa o TZ do navegador, o que para o
 *   mercado brasileiro padrão é equivalente a `America/Sao_Paulo`. Tech debt
 *   conhecido — quando expandirmos pra equipes em fuso diferente, adicionar
 *   `@fullcalendar/luxon3` e configurar `timeZone: 'America/Sao_Paulo'`.
 */
export function CalendarClient({ professionals, pickers, initialProfessionalId }: Props) {
  const calendarRef = useRef<FullCalendar | null>(null);
  const eventsRef = useRef<Map<string, AgendaEvent>>(new Map());
  const router = useRouter();
  const searchParams = useSearchParams();
  const novoParam = searchParams?.get('novo') === '1';

  const [view, setView] = useState<AgendaView>('timeGridWeek');
  const [title, setTitle] = useState('');
  const [selectedEvent, setSelectedEvent] = useState<AgendaEvent | null>(null);
  const [selectedProfessionalId, setSelectedProfessionalId] = useState<string | null>(
    initialProfessionalId,
  );
  const [truncated, setTruncated] = useState(false);

  // Story 2.5 — formulário de novo agendamento.
  // Story 5.7 — `?novo=1` (FAB do BottomNav, J2 mobile) abre o sheet automático.
  const [formOpen, setFormOpen] = useState(false);
  const [formInitialStartsAt, setFormInitialStartsAt] = useState<Date | null>(null);
  // Pattern "adjust state during render" (React docs) — reage a mudanças de
  // `novoParam` (hook reativo) sem violar a regra `react-hooks/set-state-in-effect`
  // do React 19. Inicializa com `false` para que o primeiro render com
  // `?novo=1` na URL dispare a abertura corretamente.
  const [prevNovoParam, setPrevNovoParam] = useState(false);
  if (prevNovoParam !== novoParam) {
    setPrevNovoParam(novoParam);
    if (novoParam) {
      setFormInitialStartsAt(null);
      setFormOpen(true);
    }
  }

  // Mobile default = day view (AC1.1). Não chamamos setState aqui — a
  // sincronização do state acontece via callback `datesSet` do FullCalendar
  // assim que ele aplica a mudança de view (evita warning React 19 de
  // setState em effect e elimina hydration mismatch).
  useEffect(() => {
    if (typeof window !== 'undefined' && window.matchMedia('(max-width: 640px)').matches) {
      calendarRef.current?.getApi().changeView('timeGridDay');
    }
  }, []);

  // Refetch quando filtro de profissional muda.
  useEffect(() => {
    calendarRef.current?.getApi().refetchEvents();
  }, [selectedProfessionalId]);

  const handleViewChange = useCallback((next: AgendaView) => {
    setView(next);
    calendarRef.current?.getApi().changeView(next);
  }, []);

  const handlePrev = useCallback(() => calendarRef.current?.getApi().prev(), []);
  const handleNext = useCallback(() => calendarRef.current?.getApi().next(), []);
  const handleToday = useCallback(() => calendarRef.current?.getApi().today(), []);

  const handleEventClick = useCallback((arg: EventClickArg) => {
    const cached = eventsRef.current.get(arg.event.id);
    if (cached) setSelectedEvent(cached);
  }, []);

  // Story 2.5 — abre o formulário de novo agendamento.
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

  // Quando o sheet fecha, limpa o `?novo=1` para que o próximo toque no FAB
  // gere uma nova navegação (e o useEffect dispare a reabertura). Sem isso,
  // tocar `+` duas vezes seguidas no mesmo URL não tem efeito.
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
        const result = await listAppointments({
          start: info.startStr,
          end: info.endStr,
          professionalId: selectedProfessionalId ?? undefined,
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
            ...(e.extendedProps.status === 'cancelled'
              ? { classNames: ['opacity-40'] }
              : {}),
            extendedProps: e.extendedProps as unknown as Record<string, unknown>,
          })),
        );
      } catch (err) {
        failure(err instanceof Error ? err : new Error(String(err)));
      }
    },
    [selectedProfessionalId],
  );

  return (
    <div className="flex flex-1 flex-col gap-3">
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
      />

      {truncated ? (
        // Story 6.0 (AC4) — fonte única de "warning visual" via AlertCard.
        // Substitui banner inline cru `border-amber-300 bg-amber-50` que
        // duplicava a linguagem do <AlertCard severity="warning">.
        <AlertCard
          severity="warning"
          title="Período com muitos agendamentos"
          subtitle="Mais de 200 eventos neste intervalo. Refine o filtro de profissional ou diminua a faixa de datas para ver todos."
        />
      ) : null}

      <div className="flex-1 overflow-x-auto rounded-lg border border-border bg-card p-2">
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
          }}
          dayMaxEventRows={3}
          eventDisplay="block"
        />
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
