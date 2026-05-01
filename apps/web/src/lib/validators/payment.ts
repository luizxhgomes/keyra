import { z } from 'zod';

/**
 * Validador de pagamento (Story 3.2).
 *
 * - `gross_amount` é o valor bruto que o cliente paga.
 * - `fee_rate_snapshot` e `fee_fixed_snapshot` são copiados do
 *   `payment_method` no momento do registro (preserva histórico se a
 *   taxa do método mudar depois).
 * - `fee_amount = round(gross × fee_rate, 2) + fee_fixed` (calculado
 *   server-side com Decimal.js + ROUND_HALF_EVEN, NFR-FI-01).
 * - `net_amount = gross_amount - fee_amount` — mantido pelo CHECK
 *   constraint do banco; aqui apenas verificamos.
 * - `installments` ≥ 1 (default 1).
 * - `paid_at` em ISO string; `settled_at` calculado como
 *   `paid_at + payment_method.settlement_days × 1 day`.
 */
const positiveMoney = (label: string) =>
  z.union([z.number(), z.string()]).transform((v, ctx) => {
    const n = typeof v === 'string' ? Number(v.replace(',', '.')) : v;
    if (Number.isNaN(n) || n <= 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `${label} deve ser maior que zero`,
      });
      return z.NEVER;
    }
    return n;
  });

export const registerPaymentSchema = z.object({
  commandId: z.string().uuid(),
  paymentMethodId: z.string().uuid('Forma de pagamento obrigatória'),
  accountId: z.string().uuid('Conta de destino obrigatória'),
  grossAmount: positiveMoney('Valor'),
  installments: z
    .number()
    .int()
    .min(1)
    .max(48)
    .optional()
    .default(1),
  externalReference: z
    .string()
    .max(120)
    .optional()
    .transform((v) => (v === undefined || v === '' ? undefined : v.trim())),
  notes: z
    .string()
    .max(500)
    .optional()
    .transform((v) => (v === undefined || v === '' ? undefined : v)),
});

export type RegisterPaymentInput = z.input<typeof registerPaymentSchema>;
