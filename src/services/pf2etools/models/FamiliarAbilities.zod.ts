import { z } from 'zod';
import { zEntrySchema } from '../entries.zod.js';

export type FamiliarAbility = z.infer<typeof zFamiliarAbilitySchema>;
export const zFamiliarAbilitySchema = z
	.object({
		name: z.string(),
		source: z.string(),
		page: z.number(),
		type: z.string(),
		entries: z.array(zEntrySchema),
	})
	.strict();
