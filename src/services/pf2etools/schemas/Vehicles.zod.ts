import { z } from 'zod';
import { zAbilityListEntrySchema } from './index.js';
import { zDefensesSchema, zSpeedSchema, zTypedNumberSchema } from './index.js';

export type Vehicle = z.infer<typeof zVehicleSchema>;
export const zVehicleSchema = z.strictObject({
	name: z.string(),
	source: z.string(),
	page: z.number(),
	level: z.number(),
	traits: z.array(z.string()),
	price: z.strictObject({ coin: z.string(), amount: z.number() }).optional(),
	space: z.strictObject({
		long: zTypedNumberSchema,
		wide: zTypedNumberSchema,
		high: zTypedNumberSchema,
	}),
	crew: z.array(
		z.union([
			z.strictObject({ type: z.string(), number: z.number() }),
			z.strictObject({ type: z.string(), number: z.number(), entry: z.string() }),
		])
	),
	passengers: z.number().optional(),
	pilotingCheck: z.array(
		z.strictObject({ skill: z.string(), dc: z.number(), entry: z.string().optional() })
	),
	defenses: zDefensesSchema.optional(),
	speed: zSpeedSchema.or(
		z
			.object({
				type: z.string(),
				entry: z.string().optional(),
				speed: z.number().optional(),
				note: z.string().optional(),
				traits: z.string().array().optional(),
			})
			.array()
	),
	collision: z.strictObject({
		damage: z.string().optional(),
		dc: z.number().optional(),
		entries: z.string().optional(),
	}),
	abilities: zAbilityListEntrySchema.optional(),
	entries: z.array(z.string()).optional(),
	destruction: z.string().array().optional(),
	passengersNote: z.string().optional(),
});
