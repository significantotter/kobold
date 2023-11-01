import { z } from 'zod';
import { zEntrySchema } from './lib/entries.zod.js';
import { zAbilityScoreSchema } from './lib/helpers.zod.js';

export type Eidolon = z.infer<typeof zEidolonSchema>;
export const zEidolonSchema = z.strictObject({
	name: z.string(),
	type: z.string(),
	source: z.string(),
	page: z.number(),
	fluff: zEntrySchema.array(),
	tradition: z.string(),
	traditionNote: z.string().optional(),
	traits: z.array(z.string()),
	alignment: z.string().optional(),
	home: z.string(),
	size: z.array(z.string()),
	suggestedAttacks: z.array(z.string()),
	stats: z.array(
		z.strictObject({
			name: z.string(),
			abilityScores: zAbilityScoreSchema,
			ac: z.strictObject({ number: z.number(), dexCap: z.number() }),
		})
	),
	skills: z.array(z.string()),
	senses: z.strictObject({ other: z.array(z.string()) }),
	languages: z.array(z.string()),
	speed: z.strictObject({ walk: z.number() }),
	abilities: z
		.object({
			type: z.union([
				z.literal('initial'),
				z.literal('symbiosis'),
				z.literal('transcendence'),
			]),
			name: z.string(),
			level: z.number().optional(),
			entries: zEntrySchema.array(),
		})
		.array(),
});
