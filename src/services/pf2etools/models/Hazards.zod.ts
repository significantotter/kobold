import { z } from 'zod';
import { zDefensesSchema, zSpeedSchema } from './lib/helpers.zod.js';
import { zAbilityEntrySchema, zAttackEntrySchema, zEntrySchema } from './lib/entries.zod.js';

export type Hazard = z.infer<typeof zHazardSchema>;
export const zHazardSchema = z.strictObject({
	name: z.string(),
	alias: z.string().array().optional(),
	add_hash: z.string().optional(),
	source: z.string(),
	page: z.number(),
	level: z.number(),
	traits: z.array(z.string()),
	stealth: z
		.object({
			bonus: z.number().optional(),
			dc: z.number().optional(),
			minProf: z.string().optional(),
			notes: z.string().optional(),
		})
		.optional(),
	perception: z
		.object({
			bonus: z.number().optional(),
			dc: z.number().optional(),
			minProf: z.string().optional(),
			notes: z.string().optional(),
		})
		.optional(),
	abilities: zAbilityEntrySchema.array().optional(),
	description: z.array(z.string()).optional(),
	disable: z.strictObject({ entries: z.array(z.string()) }),
	defenses: zDefensesSchema
		.extend({
			fort: z
				.object({ std: z.number().optional(), default: z.number().optional() })
				.optional(),
			ref: z
				.object({ std: z.number().optional(), default: z.number().optional() })
				.optional(),
			will: z
				.object({ std: z.number().optional(), default: z.number().optional() })
				.optional(),
		})
		.optional(),
	attacks: zAttackEntrySchema.array().optional(),

	actions: z.array(zEntrySchema).optional(),
	speed: zSpeedSchema.optional(),
	routine: z.array(zEntrySchema).optional(),
	reset: z.array(z.string()).optional(),
});
