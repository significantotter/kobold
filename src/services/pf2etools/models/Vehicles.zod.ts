import { z } from 'zod';
import { zAbilityListEntrySchema } from './lib/entries.zod.js';
import { zDefensesSchema, zSpeedSchema, zTypedNumberSchema } from './lib/helpers.zod.js';

export type Vehicle = z.infer<typeof zVehicleSchema>;
export const zVehicleSchema = z
	.object({
		name: z.string(),
		source: z.string(),
		page: z.number(),
		level: z.number(),
		traits: z.array(z.string()),
		price: z.object({ coin: z.string(), amount: z.number() }).optional(),
		space: z.object({
			long: zTypedNumberSchema,
			wide: zTypedNumberSchema,
			high: zTypedNumberSchema,
		}),
		crew: z.array(
			z.union([
				z.object({ type: z.string(), number: z.number() }),
				z.object({ type: z.string(), number: z.number(), entry: z.string() }),
			])
		),
		passengers: z.number().optional(),
		pilotingCheck: z.array(
			z.object({ skill: z.string(), dc: z.number(), entry: z.string().optional() })
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
		collision: z.object({
			damage: z.string().optional(),
			dc: z.number().optional(),
			entries: z.string().optional(),
		}),
		abilities: zAbilityListEntrySchema.optional(),
		entries: z.array(z.string()).optional(),
		destruction: z.string().array().optional(),
		passengersNote: z.string().optional(),
	})
	.strict();
