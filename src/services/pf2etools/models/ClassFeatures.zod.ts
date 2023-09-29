import { z } from 'zod';
import { zEntrySchema } from './index.js';

export type ClassFeature = z.infer<typeof zClassFeatureSchema>;
export const zClassFeatureSchema = z.strictObject({
	name: z.string(),
	type: z.string().optional(),
	source: z.string(),
	page: z.number(),
	className: z.string(),
	subclasses: z.string().optional(),
	classSource: z.string(),
	level: z.number(),
	entries: zEntrySchema.array(),
});
