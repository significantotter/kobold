import { z } from 'zod';
import { zAbilityEntrySchema, zCopySchema, zEntrySchema, zModSchema } from '../entries.zod.js';
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

export type CreatureTemplateFluff = z.infer<typeof zCreatureTemplateFluffSchema>;
export const zCreatureTemplateFluffSchema = z
	.object({
		name: z.string(),
		source: z.string(),
		page: z.number().optional(),
		entries: z.array(zEntrySchema).optional(),
		abilities: z
			.object({
				entries: z.array(zEntrySchema).optional(),
				abilities: z.array(zEntrySchema).optional(),
			})
			.optional(),
		optAbilities: z
			.object({
				entries: z.array(zEntrySchema).optional(),
				abilities: z.array(zEntrySchema).optional(),
			})
			.optional(),
		_copy: zCopySchema.optional(),
	})
	.strict();
