import { z } from 'zod';
import { zEntrySchema } from '../entries.zod.js';

export type VariantRule = z.infer<typeof zVariantRuleSchema>;
export const zVariantRuleSchema = z.object({
	name: z.string(),
	source: z.string(),
	page: z.number(),
	category: z.string(),
	entries: zEntrySchema.array(),
});
