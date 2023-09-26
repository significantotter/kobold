import { z } from 'zod';
import { zActivitySchema, zOtherSourceSchema, zSpeedSchema } from '../helpers.zod.js';
import {
	zAbilityEntrySchema,
	zAttackEntrySchema,
	zCopySchema,
	zEntrySchema,
	zFluffSchema,
} from '../entries.zod.js';

export type Deity = z.infer<typeof zDeitySchema>;
export const zDeitySchema = z
	.object({
		name: z.string(),
		alias: z.array(z.string()).optional(),
		pantheonMembers: z.array(z.string()).optional(),
		areasOfConcern: z.array(z.string()).optional(),
		source: z.string(),
		page: z.number(),
		otherSources: zOtherSourceSchema.optional(),
		core: z.boolean().optional(),
		alignment: z
			.object({
				alignment: z.array(z.string()).optional(),
				followerAlignment: z.array(z.string()),
				entry: z.string().optional(),
			})
			.optional(),
		category: z.string(),
		edicts: z.array(z.string()).optional(),
		anathema: z.array(z.string()).optional(),
		intercession: z
			.object({
				source: z.string(),
				flavor: z.array(z.string()),
				page: z.number(),
				'Minor Boon': z.array(z.string()),
				'Moderate Boon': z.array(z.string()),
				'Major Boon': z.array(z.string()),
				'Minor Curse': z.array(z.string()),
				'Moderate Curse': z.array(z.string()),
				'Major Curse': z.array(z.string()),
			})
			.optional(),
		hasLore: z.boolean().optional(),
		images: z.array(z.string()).optional(),
		font: z.array(z.string()).optional(),
		divineAbility: z
			.object({
				abilities: zAbilityEntrySchema.or(z.string()).array().optional(),
				entry: z.string().optional(),
			})
			.optional(),
		domains: z.array(z.string()).optional(),
		alternateDomains: z.array(z.string()).optional(),
		spells: z.record(z.coerce.number(), z.array(z.string())).optional(),
		avatar: z
			.object({
				speed: zSpeedSchema,
				airWalk: z.boolean().optional(),
				ignoreTerrain: z.boolean().optional(),
				shield: z.number().optional(),
				immune: z.array(z.string()).optional(),
				melee: z.array(zAttackEntrySchema).optional(),
				ranged: z.array(zAttackEntrySchema).optional(),
				ability: z.array(zAbilityEntrySchema).optional(),
				preface: z.string().optional(),
			})
			.optional(),
		entries: z.string().array().optional(),
		divineSkill: z
			.object({ skills: z.array(z.string()), entry: z.string().optional() })
			.optional(),
		favoredWeapon: z
			.object({ weapons: z.array(z.string()), entry: z.string().optional() })
			.optional(),
	})
	.strict();

export type DeityFluff = z.infer<typeof zDeityFluffSchema>;
export const zDeityFluffSchema = zFluffSchema;
