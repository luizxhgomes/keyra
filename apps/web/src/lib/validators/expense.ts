import { z } from 'zod';

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

export const expenseSchema = z.object({
  id: z.string().uuid().optional(),
  grossAmount: positiveMoney('Valor'),
  expenseCategoryId: z.string().uuid('Categoria obrigatória'),
  description: z
    .string()
    .min(1, 'Descrição obrigatória')
    .max(200)
    .transform((v) => v.trim()),
  referenceDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Data no formato AAAA-MM-DD'),
  accountId: z.string().uuid('Conta obrigatória'),
  supplierName: z
    .string()
    .max(160)
    .optional()
    .transform((v) => (v === undefined || v === '' ? undefined : v.trim())),
  notes: z
    .string()
    .max(500)
    .optional()
    .transform((v) => (v === undefined || v === '' ? undefined : v)),
  isFixed: z.boolean().optional().default(false),
});

export type ExpenseInput = z.infer<typeof expenseSchema>;

export const expenseIdSchema = z.object({
  id: z.string().uuid(),
});
