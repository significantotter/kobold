import { z } from 'zod';
import { zEntrySchema } from '../entries.zod.js';

export type Trait = z.infer<typeof zTraitSchema>;
export const zTraitSchema = z
	.object({
		name: z.string(),
		source: z.string(),
		page: z.number(),
		categories: z.array(z.string()),
		entries: zEntrySchema.array(),
	})
	.strict();
