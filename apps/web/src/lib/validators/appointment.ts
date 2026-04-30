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
