import { z } from 'zod';
import { zEntrySchema } from './index.js';
import { zOtherSourceSchema } from './index.js';

export type Language = z.infer<typeof zLanguageSchema>;
export const zLanguageSchema = z.strictObject({
	name: z.string(),
	alias: z.string().array().optional(),
	source: z.string(),
	page: z.number(),
	otherSources: zOtherSourceSchema.optional(),
	type: z.string(),
	regions: z.string().array().optional(),
	typicalSpeakers: z.array(z.string()).optional(),
	fonts: z.string().array().optional(),
	entries: z.array(zEntrySchema).optional(),
});
