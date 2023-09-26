import { z } from 'zod';
import { zAbilityEntrySchema, zEntrySchema } from '../entries.zod.js';
import { zTypedNumberSchema } from '../helpers.zod.js';

export type CreatureTemplate = z.infer<typeof zCreatureTemplateSchema>;
export const zCreatureTemplateSchema = z
	.object({
		name: z.string(),
		type: z.string(),
		hasLore: z.boolean().optional(),
		source: z.string(),
		page: z.number(),
		entries: zEntrySchema.array(),
		abilities: z
			.object({
				entries: zEntrySchema.array().optional(),
				abilities: zEntrySchema.array().optional(),
			})
			.optional(),
		optAbilities: z
			.object({
				entries: zEntrySchema.array().optional(),
				abilities: zEntrySchema.array().optional(),
			})
			.optional(),
	})
	.strict();
