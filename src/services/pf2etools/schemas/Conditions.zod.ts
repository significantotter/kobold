import { z } from 'zod';
import { zEntrySchema } from './index.js';

export type Condition = z.infer<typeof zConditionSchema>;
export const zConditionSchema = z.strictObject({
	name: z.string(),
	alias: z.string().array().optional(),
	source: z.string(),
	page: z.number(),
	entries: zEntrySchema.array(),
	group: z.string().optional(),
});
