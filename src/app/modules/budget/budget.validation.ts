import { z } from 'zod';

const create = z.object({
  body: z.object({
    amount: z.number({ message: 'Amount is required' }).positive('Amount must be positive'),
    month: z.number({ message: 'Month is required' }).min(1).max(12),
    year: z.number({ message: 'Year is required' }).min(2000).max(2100),
    categoryId: z.string({ message: 'Category is required' }),
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
