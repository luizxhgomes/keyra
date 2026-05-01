import { z } from 'zod';

export const txFiltersSchema = z.object({
  start: z.string().optional(),
  end: z.string().optional(),
  direction: z.enum(['credit', 'debit', 'all']).optional().default('all'),
  categoryId: z.string().uuid().optional(),
  professionalId: z.string().uuid().optional(),
  accountId: z.string().uuid().optional(),
  page: z.number().int().min(1).optional().default(1),
});

export type TransactionFilters = z.input<typeof txFiltersSchema>;
