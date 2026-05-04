import { z } from 'zod';

const create = z.object({
  body: z.object({
    amount: z.number({ required_error: 'Amount is required' }).positive('Amount must be positive'),
    month: z.number({ required_error: 'Month is required' }).min(1).max(12),
    year: z.number({ required_error: 'Year is required' }).min(2000).max(2100),
    categoryId: z.string({ required_error: 'Category is required' }),
  }),
});

const update = z.object({
  body: z.object({
    amount: z.number().positive('Amount must be positive').optional(),
  }),
});

const getAll = z.object({
  query: z.object({
    month: z.string().optional(),
    year: z.string().optional(),
  }),
});

export const BudgetValidation = { create, update, getAll };
