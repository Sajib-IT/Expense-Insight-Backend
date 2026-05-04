import { z } from 'zod';

const extractFromText = z.object({
  body: z.object({
    text: z.string({ message: 'Text is required' }).min(3, 'Text must be at least 3 characters'),
  }),
});

export const AiExtractValidation = { extractFromText };
