import { z } from 'zod';

export const ringCallSchema = z.object({
  notes: z.string().optional(),
});
