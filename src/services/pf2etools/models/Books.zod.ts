import { z } from 'zod';
import { zEntrySchema } from './lib/entries.zod.js';

export type Book = z.infer<typeof zBookSchema>;
export const zBookSchema = z.strictObject({
	data: zEntrySchema.array(),
});
