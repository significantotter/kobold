import { z } from 'zod';
import { zEntrySchema } from './index.js';

export type ClassFeature = z.infer<typeof zClassFeatureSchema>;
export const zClassFeatureSchema = z.object({
	name: z.string(),
	source: z.string(),
	page: z.number(),
	className: z.string(),
	classSource: z.string(),
	level: z.number(),
	entries: zEntrySchema.array(),
});
