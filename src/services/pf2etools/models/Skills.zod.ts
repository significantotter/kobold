import { z } from 'zod';
import { zEntrySchema } from '../entries.zod.js';

export type Skill = z.infer<typeof zSkillSchema>;
export const zSkillSchema = z
	.object({
		name: z.string(),
		source: z.string(),
		page: z.number(),
		entries: zEntrySchema,
	})
	.strict();
