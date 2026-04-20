import { z } from 'zod';

/**
 * Validador de paciente (Story 2.1).
 *
 * CPF, cpf_hash e cpf_encrypted ficam fora do MVP — serão re-ativados em Phase 5
 * quando tivermos o pipeline `pgp_sym_encrypt` + `COLUMN_ENCRYPTION_KEY` validado
 * end-to-end (ADR-017).
 */
const optionalString = (max: number) =>
  z
    .string()
    .max(max)
    .optional()
    .transform((v) => (v === undefined || v === '' ? undefined : v));

export const patientSchema = z.object({
  id: z.string().uuid().optional(),
  fullName: z
    .string()
    .min(1, 'Nome é obrigatório')
    .max(200, 'Nome muito longo')
    .transform((v) => v.trim()),
  phone: optionalString(32),
  email: z
    .string()
    .email('Email inválido')
    .max(160)
    .toLowerCase()
    .optional()
    .or(z.literal('').transform(() => undefined)),
  birthDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Data inválida (use YYYY-MM-DD)')
    .optional()
    .or(z.literal('').transform(() => undefined)),
  notes: optionalString(2000),
});

export type PatientInput = z.infer<typeof patientSchema>;

export const patientIdSchema = z.object({
  id: z.string().uuid(),
});
