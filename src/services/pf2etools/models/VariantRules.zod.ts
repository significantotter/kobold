import { z } from 'zod';
import { zEntrySchema } from './lib/entries.zod.js';

export type VariantRule = z.infer<typeof zVariantRuleSchema>;
export const zVariantRuleSchema = z.strictObject({
	name: z.string(),
	source: z.string(),
	page: z.number(),
	category: z.string(),
	subCategory: z.string().optional(),
	rarity: z.string().optional(),
	entries: zEntrySchema.array(),
});
