import { z } from 'zod';
import { zEntrySchema } from './index.js';

export type SubclassFeature = z.infer<typeof zSubclassFeatureSchema>;
export const zSubclassFeatureSchema = z.object({
	name: z.string(),
	source: z.string(),
	page: z.number(),
	className: z.string(),
	classSource: z.string(),
	subclassShortName: z.string(),
	subclassSource: z.string(),
	level: z.number(),
	entries: zEntrySchema.array(),
});
