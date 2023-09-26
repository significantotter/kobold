import { z } from 'zod';
import { zEntrySchema } from '../entries.zod.js';

export type Source = z.infer<typeof zSourceSchema>;
export const zSourceSchema = z
	.object({
		source: z.string(),
		date: z.string(),
		store: z.string(),
		name: z.string(),
		entries: zEntrySchema.array(),
	})
	.strict();
