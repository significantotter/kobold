import { z } from 'zod';
import { zEntrySchema } from '../entries.zod.js';

export type Event = z.infer<typeof zEventSchema>;
export const zEventSchema = z
	.object({
		name: z.string(),
		source: z.string(),
		page: z.number(),
		level: z.number(),
		traits: z.array(z.string()),
		applicableSkills: z.array(z.string()),
		entries: zEntrySchema.array(),
	})
	.strict();
