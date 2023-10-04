import { z } from 'zod';
import { zEntrySchema } from './index.js';

export type Skill = z.infer<typeof zSkillSchema>;
export const zSkillSchema = z.strictObject({
	name: z.string(),
	source: z.string(),
	page: z.number(),
	entries: zEntrySchema.array(),
});
