import { z } from 'zod';

export const SERVICE_TYPES = ['service', 'product'] as const;
export type ServiceType = (typeof SERVICE_TYPES)[number];

const optionalString = (max: number) =>
  z
    .string()
    .max(max)
    .optional()
    .transform((v) => (v === undefined || v === '' ? undefined : v));

export const serviceSchema = z.object({
  id: z.string().uuid().optional(),
  name: z
    .string()
    .min(1, 'Nome é obrigatório')
    .max(160)
    .transform((v) => v.trim()),
  type: z.enum(SERVICE_TYPES),
  categoryId: z.string().uuid().optional().or(z.literal('').transform(() => undefined)),
  price: z
    .number({ invalid_type_error: 'Preço inválido' })
    .nonnegative('Preço não pode ser negativo')
    .max(999_999_999_999.99, 'Preço fora do range'),
  unitCost: z
    .number()
    .nonnegative('Custo não pode ser negativo')
    .optional(),
  commissionPercent: z
    .number()
    .min(0, 'Comissão mínima 0%')
    .max(100, 'Comissão máxima 100%')
    .optional(),
  durationMinutes: z
    .number()
    .int()
    .positive('Duração deve ser > 0')
    .max(24 * 60, 'Máximo 1 dia')
    .optional(),
  description: optionalString(1000),
  active: z.boolean().optional(),
});

export type ServiceInput = z.infer<typeof serviceSchema>;

export const serviceIdSchema = z.object({ id: z.string().uuid() });

export const categorySchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(1, 'Nome é obrigatório').max(80).transform((v) => v.trim()),
  color: z
    .string()
    .regex(/^#[0-9a-fA-F]{6}$/, 'Cor hex #RRGGBB')
    .optional()
    .or(z.literal('').transform(() => undefined)),
  sortOrder: z.number().int().min(0).max(9999).optional(),
});

export type CategoryInput = z.infer<typeof categorySchema>;

export const categoryIdSchema = z.object({ id: z.string().uuid() });
