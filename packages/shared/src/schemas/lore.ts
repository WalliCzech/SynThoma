import { z } from 'zod';

export const LoreEntrySchema = z.object({
  id: z.string(),
  title: z.string(),
  content: z.string(),
  tags: z.array(z.string()).default([]),
  createdAt: z.string().datetime().optional(),
  updatedAt: z.string().datetime().optional(),
});

export type LoreEntry = z.infer<typeof LoreEntrySchema>;
