import { z } from 'zod';
import { zEntrySchema } from './lib/entries.zod.js';
import { zOtherSourceSchema } from './lib/helpers.zod.js';

export type Language = z.infer<typeof zLanguageSchema>;
export const zLanguageSchema = z
	.object({
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
	})
	.strict();
