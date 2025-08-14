import { z } from 'zod';

export const EmotionTag = z.enum(['fear', 'guilt', 'pride', 'oblivion']);

export const EventTag = z.union([
  z.literal('glitch'),
  z.literal('memory_trap'),
  z.literal('combat'),
  z.literal('lore'),
  z.tuple([z.literal('portal'), EmotionTag]).transform(([_, e]) => `portal:${e}` as const),
  z.string().regex(/^portal:(fear|guilt|pride|oblivion)$/)
]);

export const ChoiceSchema = z.object({
  id: z.string(),
  label: z.string().min(1),
  meta: z.record(z.any()).optional(),
});

export const EventSchema = z.object({
  id: z.string(),
  text: z.string().min(1),
  tags: z.array(z.union([z.literal('glitch'), z.literal('memory_trap'), z.literal('combat'), z.literal('lore'), z.string().regex(/^portal:(fear|guilt|pride|oblivion)$/)])).default([]),
  choices: z.array(ChoiceSchema).min(1),
});

export const RunStateSchema = z.object({
  playerId: z.string(),
  cycle: z.number().int().nonnegative(),
  location: z.string().default('Prázdnota'),
  stats: z.object({
    health: z.number().min(0).max(100),
    stamina: z.number().min(0).max(100),
    sanity: z.number().min(0).max(100),
  }),
  emotions: z.object({
    fear: z.number().min(0).max(1).default(0),
    guilt: z.number().min(0).max(1).default(0),
    pride: z.number().min(0).max(1).default(0),
    oblivion: z.number().min(0).max(1).default(0),
  }),
  inventoryIds: z.array(z.string()).default([]),
  scars: z.array(z.string()).default([]),
});

export type EmotionTag = z.infer<typeof EmotionTag>;
export type Choice = z.infer<typeof ChoiceSchema>;
export type Event = z.infer<typeof EventSchema>;
export type RunState = z.infer<typeof RunStateSchema>;
