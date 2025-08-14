import { z } from 'zod';

export const ItemId = z.string();

export const ItemSchema = z.object({
  id: ItemId,
  name: z.string(),
  rarity: z.enum(['common', 'unusual', 'rare', 'mythic']).default('common'),
  description: z.string().optional(),
  lineage: z.array(ItemId).describe('rodokmen: historické ID předchozích držitelů/podob'),
  alive: z.boolean().default(false).describe('„živý artefakt“ se chová… no, živě'),
});

export const InventorySchema = z.object({
  items: z.array(ItemSchema),
});

export type Item = z.infer<typeof ItemSchema>;
export type Inventory = z.infer<typeof InventorySchema>;
