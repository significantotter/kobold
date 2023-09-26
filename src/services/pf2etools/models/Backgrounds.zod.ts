import { z } from 'zod';
import { zEntrySchema } from '../entries.zod.js';

export type Background = z.infer<typeof zBackgroundSchema>;
export const zBackgroundSchema = z
	.object({
		name: z.string(),
		source: z.string(),
		page: z.number(),
		traits: z.array(z.string()).optional(),
		entries: zEntrySchema.array(),
		boosts: z.array(z.string()),
		skills: z.array(z.string()).optional(),
		spells: z.array(z.string()).optional(),
		lore: z.array(z.string()).optional(),
		feats: z.array(z.string()).optional(),
		miscTags: z.array(z.string()).optional(),
	})
	.strict();
