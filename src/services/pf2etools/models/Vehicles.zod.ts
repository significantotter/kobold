import { z } from 'zod';
import { zAbilityListEntrySchema } from '../entries.zod.js';
import { zTypedNumberSchema } from '../helpers.zod.js';

export type Vehicle = z.infer<typeof zVehicleSchema>;
export const zVehicleSchema = z
	.object({
		name: z.string(),
		source: z.string(),
		page: z.number(),
		level: z.number(),
		traits: z.array(z.string()),
		price: z.object({ coin: z.string(), amount: z.number() }),
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
		passengers: z.number(),
		pilotingCheck: z.array(z.object({ skill: z.string(), dc: z.number() })),
		defenses: z.object({
			ac: z.object({ default: z.number() }),
			savingThrows: z.object({ fort: z.number() }),
			hardness: z.object({ default: z.number() }),
			hp: z.object({ default: z.number() }),
			bt: z.object({ default: z.number() }),
			immunities: z.array(z.string()),
			weaknesses: z.array(
				z.object({ name: z.string(), amount: z.number(), note: z.string() })
			),
		}),
		speed: z.array(
			z.object({
				type: z.string(),
				speed: z.number(),
				traits: z.array(z.string()),
			})
		),
		collision: z.object({ damage: z.string(), dc: z.number() }),
		abilities: zAbilityListEntrySchema,
	})
	.strict();
