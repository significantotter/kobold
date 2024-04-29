import { z } from 'zod';
import { zEntrySchema } from './lib/entries.zod.js';

export type Skill = z.infer<typeof zSkillSchema>;
export const zSkillSchema = z.strictObject({
	name: z.string(),
	source: z.string(),
	page: z.number(),
	entries: zEntrySchema.array(),
});
