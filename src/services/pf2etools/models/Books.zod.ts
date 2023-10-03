import { z } from 'zod';
import { zEntrySchema } from './lib/entries.zod.js';

export type Book = z.infer<typeof zBookSchema>;

export const zBookSchema = z.strictObject({
	name: z.string(),
	id: z.string(),
	source: z.string(),
	group: z.string(),
	coverUrl: z.string(),
	published: z.string(),
	author: z.string(),
	contents: z.array(
		z.strictObject({
			name: z.string(),
			headers: z.array(z.string()).optional(),
			ordinal: z
				.strictObject({ type: z.string(), identifier: z.number().or(z.string()) })
				.optional(),
		})
	),
});
