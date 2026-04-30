'use client';

import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { formatBRL } from '@/lib/money';

import type { AgendaEvent, AgendaStatus } from './actions';

type Props = {
  event: AgendaEvent | null;
  onOpenChange: (open: boolean) => void;
};

const STATUS_LABEL: Record<AgendaStatus, string> = {
  scheduled: 'Agendado',
  done: 'Realizado',
  cancelled: 'Cancelado',
  no_show: 'Falta',
};

/**
 * Sheet (drawer lateral) com detalhes de um agendamento.
 *
 * Os botões de ação (editar, concluir, cancelar) são placeholders nesta
 * Story 2.4 — Stories 2.5 (editar) e 2.6 (concluir/cancelar) ativam o
 * comportamento real. O click só dispara um console.log + toast estilo
 * "em breve" para deixar o feedback óbvio durante o smoke test.
 */
export function EventDetailSheet({ event, onOpenChange }: Props) {
  const isOpen = event !== null;

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-md">
        {event ? (
          <>
            <SheetHeader>
              <SheetTitle className="text-left">
                {event.extendedProps.serviceName}
              </SheetTitle>
              <SheetDescription className="text-left">
                {STATUS_LABEL[event.extendedProps.status]} ·{' '}
                {formatRange(event.start, event.end)}
              </SheetDescription>
            </SheetHeader>

            <div className="flex flex-col gap-3 px-4 py-2 text-sm">
              <DetailRow label="Paciente" value={event.extendedProps.customerName ?? '—'} />
              <DetailRow label="Profissional" value={event.extendedProps.professionalName} />
              <DetailRow
                label="Receita prevista"
                value={formatBRL(event.extendedProps.priceSnapshot)}
              />
              {event.extendedProps.notes ? (
                <DetailRow label="Observações" value={event.extendedProps.notes} />
              ) : null}
            </div>

            <SheetFooter className="flex-col gap-2 sm:flex-col">
              <Button
                type="button"
                variant="default"
                className="w-full"
                disabled
                aria-label="Concluir atendimento (em breve)"
              >
                Concluir atendimento (Story 2.6)
              </Button>
              <Button
                type="button"
                variant="outline"
                className="w-full"
                disabled
                aria-label="Editar agendamento (em breve)"
              >
                Editar (Story 2.5)
              </Button>
              <Button
                type="button"
                variant="outline"
                className="w-full"
                disabled
                aria-label="Cancelar agendamento (em breve)"
              >
                Cancelar (Story 2.6)
              </Button>
              <SheetClose asChild>
                <Button type="button" variant="ghost" className="w-full">
                  Fechar
                </Button>
              </SheetClose>
            </SheetFooter>
          </>
        ) : null}
      </SheetContent>
    </Sheet>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-xs uppercase tracking-wide text-muted-foreground">
        {label}
      </span>
      <span className="text-foreground">{value}</span>
    </div>
  );
}

function formatRange(startISO: string, endISO: string): string {
  const start = new Date(startISO);
  const end = new Date(endISO);
  const sameDay = start.toDateString() === end.toDateString();
  const datePart = format(start, "EEEE, d 'de' MMMM", { locale: ptBR });
  const startTime = format(start, 'HH:mm');
  const endTime = format(end, sameDay ? 'HH:mm' : "d 'de' MMM HH:mm", { locale: ptBR });
  return `${capitalize(datePart)} · ${startTime}–${endTime}`;
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
