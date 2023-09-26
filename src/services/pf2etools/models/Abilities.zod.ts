import { z } from 'zod';
import { zActivitySchema, zFrequencySchema, zOtherSourceSchema } from '../helpers.zod.js';
import { Entry, zEntrySchema } from '../entries.zod.js';

const baseAbilitySchema = z.object({
	activity: zActivitySchema.optional(),
	components: z.string().array().optional(),
	creature: z.string().array().optional(),
	name: z.string().optional(),
	add_hash: z.string().optional(),
	otherSources: zOtherSourceSchema.optional(),
	generic: z
		.object({
			tag: z.string(),
		})
		.optional(),
	source: z.string().optional(),
	page: z.number().optional(),
	trigger: z.string().optional(),
	frequency: zFrequencySchema.optional(),
	requirements: z.string().optional(),
	traits: z.array(z.string()).optional(),
});
export type Ability = z.infer<typeof baseAbilitySchema> & { entries: Entry[] };

export const zAbilitySchema = baseAbilitySchema
	.extend({
		entries: z.lazy<z.ZodType<Entry[]>>(() => zEntrySchema.array()),
	})
	.strict();
