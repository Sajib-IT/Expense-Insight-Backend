import { z } from 'zod';

const create = z.object({
  body: z.object({
    name: z.string({ required_error: 'Name is required' }),
    type: z.enum(['INCOME', 'EXPENSE'], { required_error: 'Type is required' }),
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
