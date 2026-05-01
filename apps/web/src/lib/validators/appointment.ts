import { z } from 'zod';

/**
 * Validador de criação de agendamento — Story 2.5.
 *
 * Decisões:
 * - `customerId` é opcional (schema do banco permite walk-in / agendamento
 *   sem paciente identificado).
 * - `date` em formato ISO `YYYY-MM-DD`; `startTime` em `HH:mm`. A combinação
 *   é convertida para `timestamptz` no servidor (Date local → UTC via
 *   `toISOString()`).
 * - `durationMinutes` mínimo 5, máximo 720 (12h) — alinhado com expectativa
 *   de procedimentos estéticos. `ends_at` é derivado, não recebido.
 * - `price_snapshot` e `commission_snapshot` NÃO ficam no schema do
 *   formulário — são calculados no servidor a partir de `services` e
 *   `professionals` no momento da criação (ADR-013, imutáveis).
 */
export const createAppointmentSchema = z.object({
  customerId: z
    .string()
    .uuid()
    .optional()
    .or(z.literal(''))
    .transform((v) => (v === '' || v === undefined ? undefined : v)),
  serviceId: z.string().uuid('Serviço obrigatório'),
  professionalId: z.string().uuid('Profissional obrigatório'),
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Data no formato AAAA-MM-DD'),
  startTime: z
    .string()
    .regex(/^\d{2}:\d{2}$/, 'Horário no formato HH:MM'),
  durationMinutes: z
    .number({ invalid_type_error: 'Duração inválida' })
    .int('Duração deve ser inteiro')
    .min(5, 'Mínimo 5 minutos')
    .max(720, 'Máximo 12 horas (720 min)'),
  notes: z.string().max(500, 'Observações limitadas a 500 caracteres').optional(),
});

export type CreateAppointmentInput = z.input<typeof createAppointmentSchema>;
export type CreateAppointmentParsed = z.output<typeof createAppointmentSchema>;

/**
 * Validador de transição de status — Story 2.6.
 *
 * Transições permitidas (espelham AC1 da Story 2.6 — defesa em profundidade
 * antes do banco):
 *   - scheduled → done | cancelled | no_show
 *   - done      → cancelled (correção; estornar comanda é Phase 3+)
 *   - cancelled → ❌ (read-only)
 *   - no_show   → ❌ (read-only)
 *
 * `cancelReason` só faz sentido para `to = cancelled`. Para outras transições
 * é ignorado pelo backend (e preferencialmente nem enviado).
 *
 * O combobox de motivos de cancelamento (AC4) usa rótulos canônicos definidos
 * em `CANCEL_REASON_OPTIONS`. Quando o usuário escolhe "Outro", `cancelReason`
 * vem como o texto livre digitado; quando escolhe um motivo da lista, vem
 * como `${motivo}: ${detalhe}` se houver detalhe, ou só o motivo.
 */
export const CANCEL_REASON_OPTIONS = [
  'Paciente desmarcou',
  'Conflito de agenda',
  'Profissional indisponível',
  'Outro',
] as const;

export type CancelReasonOption = (typeof CANCEL_REASON_OPTIONS)[number];

export type AppointmentStatusTo = 'done' | 'cancelled' | 'no_show';

export const changeAppointmentStatusSchema = z
  .object({
    appointmentId: z.string().uuid('ID de agendamento inválido'),
    to: z.enum(['done', 'cancelled', 'no_show']),
    cancelReason: z
      .string()
      .max(500, 'Motivo limitado a 500 caracteres')
      .optional(),
  })
  .superRefine((val, ctx) => {
    if (val.to === 'cancelled') {
      const reason = val.cancelReason?.trim() ?? '';
      if (!reason) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['cancelReason'],
          message: 'Motivo do cancelamento é obrigatório',
        });
      }
    }
  });

export type ChangeAppointmentStatusInput = z.input<typeof changeAppointmentStatusSchema>;
