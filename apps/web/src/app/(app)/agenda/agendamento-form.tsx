'use client';

import { useEffect, useTransition } from 'react';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { formatBRL } from '@/lib/money';
import {
  createAppointmentSchema,
  type CreateAppointmentInput,
} from '@/lib/validators/appointment';

import {
  createAppointment,
  type AgendaPickerCustomer,
  type AgendaPickerProfessional,
  type AgendaPickerService,
} from './actions';

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Pickers carregados pelo Server Component pai (evita useEffect+setState
   * no client e cumpre a regra `react-hooks/set-state-in-effect`). */
  pickers: {
    customers: AgendaPickerCustomer[];
    services: AgendaPickerService[];
    professionals: AgendaPickerProfessional[];
  };
  /** Pré-preenche data e hora do início (vindo de click em slot do
   * FullCalendar). Quando ausente, defaultamos para hoje + próxima hora cheia. */
  initialStartsAt?: Date | null;
  /** Pré-seleciona um profissional (vindo do filtro atual da agenda). */
  initialProfessionalId?: string | null;
  /** Callback após criação bem-sucedida. Calendar usa para refetch. */
  onCreated?: (id: string) => void;
};

const NO_CUSTOMER = '__no_customer__';

/**
 * Sheet de criação de agendamento — Story 2.5.
 *
 * - Pickers (paciente/serviço/profissional) são carregados no SSR pelo
 *   `page.tsx` e passados como prop. Mantém o form puro: zero useEffect com
 *   setState, zero loading state local. Refresh dos pickers exige reload
 *   da página (aceitável para MVP).
 * - Auto-preenche `durationMinutes` ao selecionar serviço (se o serviço tem
 *   `duration_minutes` cadastrado). Atualiza direto no `onValueChange` do
 *   Select para não cair na regra `react-hooks/set-state-in-effect`.
 * - Mostra horário fim calculado em tempo real (apenas display).
 * - Trata double-book com toast `sonner`. Form fica aberto pra ajuste.
 */
export function AgendamentoForm({
  open,
  onOpenChange,
  pickers,
  initialStartsAt = null,
  initialProfessionalId = null,
  onCreated,
}: Props) {
  const [pending, startTransition] = useTransition();

  const form = useForm<CreateAppointmentInput>({
    resolver: zodResolver(createAppointmentSchema),
    defaultValues: computeDefaults(initialStartsAt, initialProfessionalId),
  });

  // Reset form quando abre. `form.reset` é API do react-hook-form, não
  // setState do React — não viola `react-hooks/set-state-in-effect`.
  useEffect(() => {
    if (open) {
      form.reset(computeDefaults(initialStartsAt, initialProfessionalId));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // useWatch é preferido sobre form.watch() — compatível com React Compiler
  // (regra `react-hooks/incompatible-library`).
  const watchedDate = useWatch({ control: form.control, name: 'date' });
  const watchedStart = useWatch({ control: form.control, name: 'startTime' });
  const watchedDuration = useWatch({ control: form.control, name: 'durationMinutes' });
  const watchedServiceId = useWatch({ control: form.control, name: 'serviceId' });
  const watchedProfessionalId = useWatch({ control: form.control, name: 'professionalId' });

  const endsAtPreview = computeEndsAt(watchedDate, watchedStart, watchedDuration);
  const selectedService = pickers.services.find((s) => s.id === watchedServiceId);
  const selectedProfessional = pickers.professionals.find(
    (p) => p.id === watchedProfessionalId,
  );
  const previewCommission = computePreviewCommission(selectedService, selectedProfessional);

  function onSubmit(values: CreateAppointmentInput) {
    startTransition(async () => {
      const result = await createAppointment(values);
      if (result.ok) {
        toast.success('Agendamento criado', {
          description: 'A agenda foi atualizada.',
        });
        onCreated?.(result.data.id);
        onOpenChange(false);
      } else {
        toast.error('Não foi possível agendar', { description: result.error });
      }
    });
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full overflow-y-auto sm:max-w-lg">
        <SheetHeader>
          <SheetTitle className="text-left">Novo agendamento</SheetTitle>
          <SheetDescription className="text-left">
            Selecione paciente, serviço, profissional e horário. Preço e comissão
            são travados no momento da criação.
          </SheetDescription>
        </SheetHeader>

        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex flex-col gap-4 px-4 py-2"
        >
          {/* Paciente */}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="customerId">Paciente</Label>
            <Controller
              control={form.control}
              name="customerId"
              render={({ field }) => (
                <Select
                  value={field.value ?? NO_CUSTOMER}
                  onValueChange={(v) =>
                    field.onChange(v === NO_CUSTOMER ? undefined : v)
                  }
                  
                >
                  <SelectTrigger id="customerId" aria-label="Paciente">
                    <SelectValue placeholder="Selecione (ou deixe em branco)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={NO_CUSTOMER}>Sem paciente identificado</SelectItem>
                    {pickers.customers.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.full_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          {/* Serviço */}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="serviceId">Serviço *</Label>
            <Controller
              control={form.control}
              name="serviceId"
              render={({ field, fieldState }) => (
                <>
                  <Select
                    {...(field.value ? { value: field.value } : {})}
                    onValueChange={(v) => {
                      field.onChange(v);
                      const svc = pickers.services.find((s) => s.id === v);
                      if (svc?.duration_minutes) {
                        form.setValue('durationMinutes', svc.duration_minutes, {
                          shouldValidate: true,
                        });
                      }
                    }}
                    
                  >
                    <SelectTrigger
                      id="serviceId"
                      aria-invalid={fieldState.invalid}
                      aria-label="Serviço"
                    >
                      <SelectValue placeholder="Selecione um serviço" />
                    </SelectTrigger>
                    <SelectContent>
                      {pickers.services.map((s) => (
                        <SelectItem key={s.id} value={s.id}>
                          {s.name} — {formatBRL(s.price)}
                          {s.duration_minutes ? ` · ${s.duration_minutes}min` : ''}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {fieldState.error ? (
                    <p className="text-xs text-destructive" role="alert">
                      {fieldState.error.message}
                    </p>
                  ) : null}
                </>
              )}
            />
          </div>

          {/* Profissional */}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="professionalId">Profissional *</Label>
            <Controller
              control={form.control}
              name="professionalId"
              render={({ field, fieldState }) => (
                <>
                  <Select
                    {...(field.value ? { value: field.value } : {})}
                    onValueChange={field.onChange}
                    
                  >
                    <SelectTrigger
                      id="professionalId"
                      aria-invalid={fieldState.invalid}
                      aria-label="Profissional"
                    >
                      <SelectValue placeholder="Selecione um profissional" />
                    </SelectTrigger>
                    <SelectContent>
                      {pickers.professionals.map((p) => (
                        <SelectItem key={p.id} value={p.id}>
                          {p.display_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {fieldState.error ? (
                    <p className="text-xs text-destructive" role="alert">
                      {fieldState.error.message}
                    </p>
                  ) : null}
                </>
              )}
            />
          </div>

          {/* Data + horário início */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="date">Data *</Label>
              <Input
                id="date"
                type="date"
                aria-invalid={!!form.formState.errors.date}
                {...form.register('date')}
              />
              {form.formState.errors.date ? (
                <p className="text-xs text-destructive" role="alert">
                  {form.formState.errors.date.message}
                </p>
              ) : null}
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="startTime">Início *</Label>
              <Input
                id="startTime"
                type="time"
                aria-invalid={!!form.formState.errors.startTime}
                {...form.register('startTime')}
              />
              {form.formState.errors.startTime ? (
                <p className="text-xs text-destructive" role="alert">
                  {form.formState.errors.startTime.message}
                </p>
              ) : null}
            </div>
          </div>

          {/* Duração */}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="durationMinutes">Duração (minutos) *</Label>
            <Input
              id="durationMinutes"
              type="number"
              min={5}
              max={720}
              step={5}
              aria-invalid={!!form.formState.errors.durationMinutes}
              {...form.register('durationMinutes', { valueAsNumber: true })}
            />
            {form.formState.errors.durationMinutes ? (
              <p className="text-xs text-destructive" role="alert">
                {form.formState.errors.durationMinutes.message}
              </p>
            ) : null}
          </div>

          {/* Preview de horário fim, preço e comissão */}
          <div className="rounded-md bg-muted/40 p-3 text-sm">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <span className="text-xs uppercase tracking-wide text-muted-foreground">
                  Término previsto
                </span>
                <p className="font-medium text-foreground">
                  {endsAtPreview ?? '—'}
                </p>
              </div>
              <div>
                <span className="text-xs uppercase tracking-wide text-muted-foreground">
                  Receita prevista
                </span>
                <p className="font-medium text-foreground">
                  {selectedService ? formatBRL(selectedService.price) : '—'}
                </p>
              </div>
              <div className="col-span-2">
                <span className="text-xs uppercase tracking-wide text-muted-foreground">
                  Comissão (snapshot)
                </span>
                <p className="font-medium text-foreground">
                  {previewCommission ?? '—'}
                </p>
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="notes">Observações</Label>
            <textarea
              id="notes"
              rows={3}
              maxLength={500}
              className="rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              placeholder="Opcional — visível apenas para a equipe"
              {...form.register('notes')}
            />
            {form.formState.errors.notes ? (
              <p className="text-xs text-destructive" role="alert">
                {form.formState.errors.notes.message}
              </p>
            ) : null}
          </div>

          <SheetFooter className="flex-col gap-2 sm:flex-col">
            <Button type="submit" className="w-full" disabled={pending}>
              {pending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                  Salvando...
                </>
              ) : (
                'Agendar'
              )}
            </Button>
            <Button
              type="button"
              variant="ghost"
              className="w-full"
              disabled={pending}
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}

// ---------------------------------------------------------------------------
// helpers
// ---------------------------------------------------------------------------

function computeDefaults(
  initialStartsAt: Date | null,
  initialProfessionalId: string | null,
): CreateAppointmentInput {
  const base = initialStartsAt ?? roundedNextHour();
  return {
    customerId: undefined,
    serviceId: '',
    professionalId: initialProfessionalId ?? '',
    date: toDateInput(base),
    startTime: toTimeInput(base),
    durationMinutes: 60,
    notes: undefined,
  };
}

function roundedNextHour(): Date {
  const d = new Date();
  d.setMinutes(0, 0, 0);
  d.setHours(d.getHours() + 1);
  return d;
}

function toDateInput(d: Date): string {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

function toTimeInput(d: Date): string {
  const hh = String(d.getHours()).padStart(2, '0');
  const mm = String(d.getMinutes()).padStart(2, '0');
  return `${hh}:${mm}`;
}

function computeEndsAt(
  date: string | undefined,
  start: string | undefined,
  duration: number | undefined,
): string | null {
  if (!date || !start || !duration || Number.isNaN(duration)) return null;
  const d = new Date(`${date}T${start}:00`);
  if (Number.isNaN(d.getTime())) return null;
  const end = new Date(d.getTime() + duration * 60 * 1000);
  const hh = String(end.getHours()).padStart(2, '0');
  const mm = String(end.getMinutes()).padStart(2, '0');
  return `${hh}:${mm}`;
}

function computePreviewCommission(
  service: AgendaPickerService | undefined,
  professional: AgendaPickerProfessional | undefined,
): string | null {
  if (!service && !professional) return null;
  const rate =
    service?.commission_rate ??
    professional?.default_commission_rate ??
    '0';
  const pct = Number(rate) * 100;
  if (!Number.isFinite(pct)) return null;
  return `${pct.toFixed(2).replace(/\.00$/, '')}%`;
}
