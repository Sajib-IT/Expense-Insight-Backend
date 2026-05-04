import { z } from 'zod';

const create = z.object({
  body: z.object({
    name: z.string({ message: 'Name is required' }),
    type: z.enum(['INCOME', 'EXPENSE'], { message: 'Type is required' }),
    icon: z.string().optional(),
    colour: z.string().optional(),
  }),
});

const update = z.object({
  body: z.object({
    name: z.string().optional(),
    type: z.enum(['INCOME', 'EXPENSE']).optional(),
    icon: z.string().optional(),
    colour: z.string().optional(),
  }),
});

export const CategoryValidation = { create, update };
