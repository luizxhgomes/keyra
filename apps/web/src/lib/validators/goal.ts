import { z } from 'zod';

const optionalMoney = z
  .union([z.number(), z.string()])
  .optional()
  .transform((v, ctx) => {
    if (v === undefined || v === '' || v === null) return undefined;
    const n = typeof v === 'string' ? Number(v.replace(',', '.')) : v;
    if (Number.isNaN(n) || n < 0) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Valor deve ser ≥ 0' });
      return z.NEVER;
    }
    return n;
  });

const optionalInt = z
  .union([z.number(), z.string()])
  .optional()
  .transform((v, ctx) => {
    if (v === undefined || v === '' || v === null) return undefined;
    const n = typeof v === 'string' ? Number(v) : v;
    if (Number.isNaN(n) || !Number.isFinite(n) || n < 0 || !Number.isInteger(n)) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Inteiro ≥ 0' });
      return z.NEVER;
    }
    return n;
  });

export const goalSchema = z
  .object({
    /** Mês de referência no formato YYYY-MM-01. */
    periodMonth: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato YYYY-MM-DD'),
    targetRevenue: optionalMoney,
    targetProfit: optionalMoney,
    targetAppointments: optionalInt,
    notes: z
      .string()
      .max(500)
      .optional()
      .transform((v) => (v === undefined || v === '' ? undefined : v)),
  })
  .refine(
    (d) =>
      d.targetRevenue !== undefined ||
      d.targetProfit !== undefined ||
      d.targetAppointments !== undefined,
    { message: 'Defina pelo menos uma meta (receita, lucro ou atendimentos).' },
  );

export type GoalInput = z.infer<typeof goalSchema>;
