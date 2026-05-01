'use client';

import { useState, useTransition } from 'react';
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
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { CANCEL_REASON_OPTIONS } from '@/lib/validators/appointment';

import { changeAppointmentStatus } from './actions';

type Props = {
  appointmentId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCancelled: () => void;
};

/**
 * AlertDialog reusável para coletar motivo de cancelamento (Story 2.6 AC4.1).
 *
 * UX:
 * - Combobox (Select shadcn) com 4 motivos canônicos: "Paciente desmarcou",
 *   "Conflito de agenda", "Profissional indisponível", "Outro".
 * - Textarea sempre visível para detalhe opcional. Quando o usuário escolhe
 *   "Outro", o textarea passa a ser o único portador do motivo (recusamos
 *   submeter sem texto).
 * - `cancel_reason` final é montado como `motivo: detalhe` quando há os dois,
 *   ou apenas o motivo / detalhe quando só um existe. Para "Outro" sem
 *   detalhe, o submit é bloqueado.
 * - Botões "Não cancelar" (default focus, AlertDialogCancel) e "Confirmar
 *   cancelamento" (destructive variant via className — AlertDialogAction não
 *   expõe `variant`). Submit fica desabilitado enquanto não houver motivo
 *   válido.
 */
export function CancelAppointmentDialog({
  appointmentId,
  open,
  onOpenChange,
  onCancelled,
}: Props) {
  const [reason, setReason] = useState<string>('');
  const [detail, setDetail] = useState<string>('');
  const [isPending, startTransition] = useTransition();

  // Reset state quando o diálogo (re)abre. Usamos o padrão "adjust state
  // during render" (React 19) em vez de useEffect, que dispararia render
  // em cascata e violaria a regra `react-hooks/set-state-in-effect`.
  // Ref: https://react.dev/learn/you-might-not-need-an-effect#adjusting-some-state-when-a-prop-changes
  const [prevOpen, setPrevOpen] = useState<boolean>(open);
  if (open !== prevOpen) {
    setPrevOpen(open);
    if (open) {
      setReason('');
      setDetail('');
    }
  }

  const isOther = reason === 'Outro';
  const trimmedDetail = detail.trim();
  const canSubmit = (() => {
    if (!appointmentId) return false;
    if (!reason) return false;
    if (isOther) return trimmedDetail.length > 0;
    return true;
  })();

  const handleConfirm = () => {
    if (!appointmentId || !canSubmit) return;

    const finalReason = (() => {
      if (isOther) return trimmedDetail;
      if (trimmedDetail) return `${reason}: ${trimmedDetail}`;
      return reason;
    })();

    startTransition(async () => {
      const result = await changeAppointmentStatus({
        appointmentId,
        to: 'cancelled',
        cancelReason: finalReason,
      });
      if (result.ok) {
        toast.success('Agendamento cancelado.');
        onCancelled();
        onOpenChange(false);
      } else {
        toast.error(result.error);
      }
    });
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Cancelar agendamento?</AlertDialogTitle>
          <AlertDialogDescription>
            Selecione o motivo do cancelamento. Esta ação fica registrada no
            histórico do paciente.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="cancel-reason">Motivo</Label>
            <Select value={reason} onValueChange={setReason}>
              <SelectTrigger id="cancel-reason" aria-label="Motivo do cancelamento">
                <SelectValue placeholder="Selecione um motivo" />
              </SelectTrigger>
              <SelectContent>
                {CANCEL_REASON_OPTIONS.map((opt) => (
                  <SelectItem key={opt} value={opt}>
                    {opt}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="cancel-detail">
              {isOther ? 'Descreva o motivo' : 'Detalhe (opcional)'}
            </Label>
            <Textarea
              id="cancel-detail"
              value={detail}
              onChange={(e) => setDetail(e.target.value)}
              placeholder={
                isOther
                  ? 'Ex.: Paciente reagendou para a próxima semana'
                  : 'Adicione contexto, se quiser'
              }
              maxLength={500}
              rows={3}
            />
          </div>
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Não cancelar</AlertDialogCancel>
          <AlertDialogAction
            disabled={!canSubmit || isPending}
            onClick={(e) => {
              e.preventDefault();
              handleConfirm();
            }}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isPending ? 'Cancelando…' : 'Confirmar cancelamento'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
