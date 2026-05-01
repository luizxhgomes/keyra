import { z } from 'zod';

/**
 * Validador de insumo (Story 2.3).
 *
 * Schema reflete `supplies` (migration 008): nome obrigatório, unidade default
 * "un", custo unitário ≥ 0, reorder_level (nível de recompra) opcional ≥ 0.
 * `current_stock` é cache mantido por trigger e NÃO entra no form (atualizado
 * via `inventory_movements`).
 */
const optionalString = (max: number) =>
  z
    .string()
    .max(max)
    .optional()
    .transform((v) => (v === undefined || v === '' ? undefined : v));

const positiveNumberOrUndefined = (label: string) =>
  z
    .union([z.number(), z.string()])
    .optional()
    .transform((v, ctx) => {
      if (v === undefined || v === '' || v === null) return undefined;
      const n = typeof v === 'string' ? Number(v.replace(',', '.')) : v;
      if (Number.isNaN(n) || n < 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `${label} deve ser um número ≥ 0`,
        });
        return z.NEVER;
      }
      return n;
    });

export const supplySchema = z.object({
  id: z.string().uuid().optional(),
  name: z
    .string()
    .min(1, 'Nome é obrigatório')
    .max(160, 'Nome muito longo')
    .transform((v) => v.trim()),
  unit: z
    .string()
    .min(1)
    .max(20)
    .default('un')
    .transform((v) => v.trim()),
  unitCost: z
    .union([z.number(), z.string()])
    .transform((v, ctx) => {
      const n = typeof v === 'string' ? Number(v.replace(',', '.')) : v;
      if (Number.isNaN(n) || n < 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Custo unitário deve ser um número ≥ 0',
        });
        return z.NEVER;
      }
      return n;
    }),
  reorderLevel: positiveNumberOrUndefined('Nível de recompra'),
  supplierName: optionalString(160),
  active: z.boolean().default(true),
});

export type SupplyInput = z.infer<typeof supplySchema>;

export const supplyIdSchema = z.object({
  id: z.string().uuid(),
});

/**
 * Schema da ligação serviço × insumo (BOM). Quantidade é numeric(14,3) no
 * banco (até 3 casas decimais para suportar mililitros/gramas com precisão).
 */
export const serviceSupplyLinkSchema = z.object({
  serviceId: z.string().uuid(),
  supplyId: z.string().uuid(),
  quantity: z
    .union([z.number(), z.string()])
    .transform((v, ctx) => {
      const n = typeof v === 'string' ? Number(v.replace(',', '.')) : v;
      if (Number.isNaN(n) || n <= 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Quantidade deve ser maior que zero',
        });
        return z.NEVER;
      }
      return n;
    }),
});

export type ServiceSupplyLinkInput = z.infer<typeof serviceSupplyLinkSchema>;

export const serviceSupplyDetachSchema = z.object({
  serviceId: z.string().uuid(),
  supplyId: z.string().uuid(),
});
