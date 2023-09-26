import { z } from 'zod';
import { zEntrySchema } from '../entries.zod.js';

export type Affliction = z.infer<typeof zAfflictionSchema>;
export const zAfflictionSchema = z
	.object({
		name: z.string(),
		source: z.string(),
		page: z.number(),
		type: z.literal('Disease').or(z.literal('Curse')),
		level: z.number().or(z.string()).optional(),
		traits: z.string().array().optional(),
		temptedCurse: z.string().array().optional(),
		entries: zEntrySchema.array(),
	})
	.strict();
