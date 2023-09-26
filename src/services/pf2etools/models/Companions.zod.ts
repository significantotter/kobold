import { z } from 'zod';
import {
	zAbilityScoreSchema,
	zSenseSchema,
	zSpeedSchema,
	zTypedNumberSchema,
} from '../helpers.zod.js';
import { zAttackEntrySchema, zEntrySchema } from '../entries.zod.js';

export type Companion = z.infer<typeof zCompanionSchema>;
export const zCompanionSchema = z
	.object({
		name: z.string(),
		source: z.string(),
		page: z.number(),
		type: z.string(),
		fluff: z.array(z.string()),
		access: z.string().optional(),
		size: z.array(z.string()),
		attacks: zAttackEntrySchema.array(),
		abilityMods: zAbilityScoreSchema,
		hp: z.number(),
		skill: z.string(),
		senses: zSenseSchema.optional(),
		speed: zSpeedSchema,
		support: z.string(),
		maneuver: z.object({
			name: z.string(),
			source: z.string(),
			page: z.number(),
			requirements: z.string().optional(),
			traits: z.string().array().optional(),
			trigger: z.string().optional(),
			activity: zTypedNumberSchema,
			frequency: zTypedNumberSchema.optional(),
			entries: zEntrySchema.array(),
		}),
		traits: z.array(z.string()).optional(),
		special: z.string().optional(),
	})
	.strict();
