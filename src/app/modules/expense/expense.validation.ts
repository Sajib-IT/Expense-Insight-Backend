import { z } from 'zod';

const create = z.object({
  body: z.object({
    amount: z.number({ message: 'Amount is required' }).positive('Amount must be positive'),
    description: z.string().optional(),
    date: z.string({ message: 'Date is required' }),
    type: z.enum(['INCOME', 'EXPENSE']).default('EXPENSE'),
    categoryId: z.string({ message: 'Category is required' }),
  }),
});

const update = z.object({
  body: z.object({
    amount: z.number().positive('Amount must be positive').optional(),
    description: z.string().optional(),
    date: z.string().optional(),
    type: z.enum(['INCOME', 'EXPENSE']).optional(),
    categoryId: z.string().optional(),
  }),
});

const getAll = z.object({
  query: z.object({
    page: z.string().optional(),
    limit: z.string().optional(),
    sortBy: z.string().optional(),
    sortOrder: z.enum(['asc', 'desc']).optional(),
    type: z.enum(['INCOME', 'EXPENSE']).optional(),
    categoryId: z.string().optional(),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    searchTerm: z.string().optional(),
  }),
});

export const ExpenseValidation = { create, update, getAll };
