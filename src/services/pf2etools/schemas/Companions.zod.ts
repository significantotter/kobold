import { z } from 'zod';
import {
	zAbilityScoreSchema,
	zActivitySchema,
	zFrequencySchema,
	zSpeedSchema,
	zTypedNumberSchema,
} from './index.js';
import { zAttackEntrySchema, zEntrySchema } from './index.js';

export const zCompanionSenseSchema = z.strictObject({
	imprecise: z.string().array().optional(),
	other: z.string().array().optional(),
});

export type Companion = z.infer<typeof zCompanionSchema>;
export const zCompanionSchema = z.strictObject({
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
	senses: zCompanionSenseSchema.optional(),
	speed: zSpeedSchema,
	support: z.string(),
	maneuver: z.strictObject({
		name: z.string(),
		source: z.string(),
		page: z.number(),
		requirements: z.string().optional(),
		traits: z.string().array().optional(),
		trigger: z.string().optional(),
		activity: zActivitySchema,
		frequency: zFrequencySchema.optional(),
		entries: zEntrySchema.array(),
	}),
	traits: z.array(z.string()).optional(),
	special: z.string().optional(),
});
