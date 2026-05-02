'use client';

import { useState, useTransition } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toast } from 'sonner';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { StatusBadge, appointmentStatusToBadge } from '@/components/keyra';
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

import { changeAppointmentStatus, type AgendaEvent, type AgendaStatus } from './actions';
import { CancelAppointmentDialog } from './cancel-dialog';

type Props = {
  event: AgendaEvent | null;
  onOpenChange: (open: boolean) => void;
  /** Callback chamado após qualquer transição de status bem-sucedida. */
  onChanged: () => void;
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
 * Story 2.6 — botões contextuais:
 *   - status `scheduled`: Concluir | Cancelar | Falta (no_show)
 *   - status `done`:      Cancelar (correção; estornar comanda é Phase 3+)
 *   - status `cancelled`/`no_show`: read-only (nenhum botão de transição)
 *
 * Editar (Story 2.5) segue como placeholder — a edição não foi implementada
 * naquela story (que entregou só criação). Mantemos o botão disabled com
 * rótulo explícito até a story de edição.
 */
export function EventDetailSheet({ event, onOpenChange, onChanged }: Props) {
  const isOpen = event !== null;

  const [confirmDoneOpen, setConfirmDoneOpen] = useState(false);
  const [confirmNoShowOpen, setConfirmNoShowOpen] = useState(false);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const status = event?.extendedProps.status ?? null;
  const showDone = status === 'scheduled';
  const showNoShow = status === 'scheduled';
  const showCancel = status === 'scheduled' || status === 'done';
  const isReadOnly = status === 'cancelled' || status === 'no_show';

  const handleConfirmDone = () => {
    if (!event) return;
    startTransition(async () => {
      const result = await changeAppointmentStatus({
        appointmentId: event.id,
        to: 'done',
      });
      if (result.ok) {
        toast.success('Atendimento concluído. Comanda gerada automaticamente.');
        setConfirmDoneOpen(false);
        onChanged();
        onOpenChange(false);
      } else {
        toast.error(result.error);
      }
    });
  };

  const handleConfirmNoShow = () => {
    if (!event) return;
    startTransition(async () => {
      const result = await changeAppointmentStatus({
        appointmentId: event.id,
        to: 'no_show',
      });
      if (result.ok) {
        toast.success('Falta registrada.');
        setConfirmNoShowOpen(false);
        onChanged();
        onOpenChange(false);
      } else {
        toast.error(result.error);
      }
    });
  };

  return (
    <>
      <Sheet open={isOpen} onOpenChange={onOpenChange}>
        <SheetContent className="w-full sm:max-w-md">
          {event ? (
            <>
              <SheetHeader>
                <SheetTitle className="text-left">
                  {event.extendedProps.serviceName}
                </SheetTitle>
                <SheetDescription className="flex flex-wrap items-center gap-2 text-left">
                  <StatusBadge
                    status={appointmentStatusToBadge(event.extendedProps.status)}
                  />
                  <span>{formatRange(event.start, event.end)}</span>
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
                {isReadOnly ? (
                  <p className="rounded-md bg-muted px-3 py-2 text-center text-xs text-muted-foreground">
                    Agendamento {STATUS_LABEL[event.extendedProps.status].toLowerCase()} —
                    somente leitura.
                  </p>
                ) : null}

                {showDone ? (
                  <Button
                    type="button"
                    variant="default"
                    className="w-full"
                    disabled={isPending}
                    onClick={() => setConfirmDoneOpen(true)}
                  >
                    Concluir atendimento
                  </Button>
                ) : null}

                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  disabled
                  aria-label="Editar agendamento (em breve)"
                >
                  Editar (em breve)
                </Button>

                {showCancel ? (
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    disabled={isPending}
                    onClick={() => setCancelOpen(true)}
                  >
                    Cancelar
                  </Button>
                ) : null}

                {showNoShow ? (
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    disabled={isPending}
                    onClick={() => setConfirmNoShowOpen(true)}
                  >
                    Falta (no-show)
                  </Button>
                ) : null}

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

      {/* Concluir — confirmação simples (AC4.3). */}
      <AlertDialog open={confirmDoneOpen} onOpenChange={setConfirmDoneOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Concluir atendimento?</AlertDialogTitle>
            <AlertDialogDescription>
              A comanda será gerada automaticamente para registrar o pagamento.
              Esta ação não pode ser desfeita por aqui — para correção,
              cancele o agendamento depois.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPending}>Voltar</AlertDialogCancel>
            <AlertDialogAction
              disabled={isPending}
              onClick={(e) => {
                e.preventDefault();
                handleConfirmDone();
              }}
            >
              {isPending ? 'Concluindo…' : 'Concluir'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Falta — confirmação simples (AC4.2). */}
      <AlertDialog open={confirmNoShowOpen} onOpenChange={setConfirmNoShowOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Marcar como falta?</AlertDialogTitle>
            <AlertDialogDescription>
              O paciente não compareceu. Esta ação fica registrada no histórico
              e não dispara cobrança automática.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPending}>Voltar</AlertDialogCancel>
            <AlertDialogAction
              disabled={isPending}
              onClick={(e) => {
                e.preventDefault();
                handleConfirmNoShow();
              }}
            >
              {isPending ? 'Registrando…' : 'Confirmar falta'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Cancelar — combobox + textarea (AC4.1). */}
      <CancelAppointmentDialog
        appointmentId={event?.id ?? null}
        open={cancelOpen}
        onOpenChange={setCancelOpen}
        onCancelled={() => {
          onChanged();
          onOpenChange(false);
        }}
      />
    </>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-label uppercase text-muted-foreground">
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
