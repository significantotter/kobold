import { z } from 'zod';
import { zEntrySchema } from './lib/entries.zod.js';

export type Source = z.infer<typeof zSourceSchema>;
export const zSourceSchema = z.strictObject({
	source: z.string(),
	date: z.string().optional(),
	errata: z.string().optional(),
	vanilla: z.boolean().optional(),
	unreleased: z.boolean().optional(),
	accessory: z.boolean().optional(),
	store: z.string(),
	name: z.string(),
	adventure: z.boolean().optional(),
	entries: zEntrySchema.array().optional(),
	defaultSource: z.array(z.string()).optional(),
});
