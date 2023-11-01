import { z } from 'zod';
import { zOtherSourceSchema } from './lib/helpers.zod.js';
import { zEntrySchema } from './lib/entries.zod.js';

export type Archetype = z.infer<typeof zArchetypeSchema>;
export const zArchetypeSchema = z.strictObject({
	name: z.string(),
	source: z.string(),
	page: z.number(),
	benefits: z.string().array().optional(),
	entries: zEntrySchema.array(),
	otherSources: zOtherSourceSchema.optional(),
	extraFeats: z.array(z.string()).optional(),
	miscTags: z.array(z.string()).optional(),
	dedicationLevel: z.number(),
	rarity: z.string().optional(),
});
