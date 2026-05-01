import { z } from 'zod';

/**
 * Validadores da Story 3.1 — Comanda automática.
 *
 * `commands.subtotal` e `command_items.total` são GENERATED no banco; o
 * trigger `trg_command_items_recompute` mantém `subtotal` automaticamente.
 * As actions só fazem INSERT/DELETE/UPDATE simples — sem recálculo na app.
 */

export const commandIdSchema = z.object({
  id: z.string().uuid('ID de comanda inválido'),
});

const positiveMoney = (label: string) =>
  z.union([z.number(), z.string()]).transform((v, ctx) => {
    const n = typeof v === 'string' ? Number(v.replace(',', '.')) : v;
    if (Number.isNaN(n) || n < 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `${label} deve ser ≥ 0`,
      });
      return z.NEVER;
    }
    return n;
  });

const positiveQuantity = z.union([z.number(), z.string()]).transform((v, ctx) => {
  const n = typeof v === 'string' ? Number(v.replace(',', '.')) : v;
  if (Number.isNaN(n) || n <= 0) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Quantidade deve ser maior que zero',
    });
    return z.NEVER;
  }
  return n;
});

export const addCommandItemSchema = z.object({
  commandId: z.string().uuid(),
  serviceId: z.string().uuid('Serviço obrigatório'),
  description: z
    .string()
    .min(1, 'Descrição obrigatória')
    .max(200, 'Descrição muito longa')
    .transform((v) => v.trim()),
  quantity: positiveQuantity,
  unitPrice: positiveMoney('Preço unitário'),
});

export type AddCommandItemInput = z.input<typeof addCommandItemSchema>;

export const removeCommandItemSchema = z.object({
  commandId: z.string().uuid(),
  itemId: z.string().uuid(),
});

export const applyDiscountSchema = z.object({
  commandId: z.string().uuid(),
  discountAmount: positiveMoney('Desconto'),
});

export type ApplyDiscountInput = z.input<typeof applyDiscountSchema>;
