import { z } from 'zod';
import { zAbilityEntrySchema, zAfflictionEntrySchema, zEntrySchema } from './lib/entries.zod.js';
import { zCopySchema } from './lib/entry-helpers.zod.js';

export type CreatureTemplate = z.infer<typeof zCreatureTemplateSchema>;
export const zCreatureTemplateSchema = z.strictObject({
	name: z.string(),
	type: z.string(),
	hasLore: z.boolean().optional(),
	source: z.string(),
	page: z.number(),
	entries: zEntrySchema.array(),
	abilities: z
		.object({
			entries: zEntrySchema.array().optional(),
			abilities: z.union([zAbilityEntrySchema, zAfflictionEntrySchema]).array().optional(),
		})
		.optional(),
	optAbilities: z
		.object({
			entries: zEntrySchema.array().optional(),
			abilities: z.union([zAbilityEntrySchema, zAfflictionEntrySchema]).array().optional(),
		})
		.optional(),
});

export type CreatureTemplateFluff = z.infer<typeof zCreatureTemplateFluffSchema>;
export const zCreatureTemplateFluffSchema = z.strictObject({
	name: z.string(),
	source: z.string(),
	page: z.number().optional(),
	entries: z.array(zEntrySchema).optional(),
	abilities: z
		.object({
			entries: z.array(zEntrySchema).optional(),
			abilities: z.array(z.union([zAbilityEntrySchema, zAfflictionEntrySchema])).optional(),
		})
		.optional(),
	optAbilities: z
		.object({
			entries: z.array(zEntrySchema).optional(),
			abilities: z.array(z.union([zAbilityEntrySchema, zAfflictionEntrySchema])).optional(),
		})
		.optional(),
	_copy: zCopySchema.optional(),
});
