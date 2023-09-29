import { z } from 'zod';
import {
	zAbilityListEntrySchema,
	zAttackEntrySchema,
	zCopySchema,
	zEntrySchema,
} from './lib/entries.zod.js';
import {
	zStatSchema,
	zRitualSchema,
	zSpellcastingMapSchema,
	zOtherSourceSchema,
	zTypedNumberSchema,
	zSpeedSchema,
	zAbilityScoreSchema,
	zDefensesSchema,
	zSpellcastingSchema,
} from './lib/helpers.zod.js';

export type CreatureSense = z.infer<typeof zCreatureSenseSchema>;
const zCreatureSenseSchema = z.strictObject({
	name: z.string(),
	type: z.string().optional(),
	range: z.union([z.number(), zTypedNumberSchema]).optional(),
	unit: z.string().optional(),
	number: z.number().optional(),
	note: z.string().optional(),
});

export type Creature = z.infer<typeof zCreatureSchema>;
export const zCreatureSchema = z.strictObject({
	name: z.string(),
	alias: z.string().array().optional(),
	isNpc: z.boolean().optional(),
	description: z.string().optional(),
	source: z.string().optional(),
	otherSources: zOtherSourceSchema.optional(),
	foundIn: z.string().array().optional(),
	page: z.number().optional(),
	level: z.number().optional(),
	hasImages: z.boolean().optional(),
	traits: z.array(z.string()).optional(),
	perception: zStatSchema.optional(),
	_copy: z.any().optional(),
	senses: zCreatureSenseSchema.array().optional(),
	skills: z
		.strictObject({ notes: z.string().array().optional() })
		.catchall(zStatSchema)
		.optional(),
	abilityMods: zAbilityScoreSchema.optional(),
	speed: zSpeedSchema.optional(),
	attacks: z.array(zAttackEntrySchema).optional(),
	rituals: z.union([zRitualSchema.array(), z.record(z.string(), zRitualSchema)]).optional(),
	abilities: zAbilityListEntrySchema.optional(),
	defenses: zDefensesSchema.optional(),
	languages: z
		.object({
			languages: z.array(z.string()).optional(),
			abilities: z.array(z.string()).optional(),
			notes: z.array(z.string()).optional(),
		})
		.optional(),
	items: z.array(z.string()).optional(),
	spellcasting: zSpellcastingSchema.array().optional(),
});

export type BestiarySchema = z.infer<typeof zBestiarySchema>;
export const zBestiarySchema = z.strictObject({
	_meta: z.strictObject({
		dependencies: z.strictObject({
			creature: z.array(z.string()),
		}),
		internalCopies: z.array(z.string()),
	}),
	creature: z.array(zCreatureSchema),
});

export type CreatureFluff = z.infer<typeof zCreatureFluffSchema>;
export const zCreatureFluffSchema = z.strictObject({
	name: z.string(),
	altName: z.string().optional(),
	source: z.string(),
	page: z.number().optional(),
	images: z.array(z.string()).optional(),
	entries: z.array(zEntrySchema).optional(),
	_copy: zCopySchema.optional(),
});
