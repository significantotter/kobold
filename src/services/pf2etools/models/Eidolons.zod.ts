import { z } from 'zod';
import { zEntrySchema } from '../entries.zod.js';
import { zAbilityScoreSchema } from '../helpers.zod.js';

export type Eidolon = z.infer<typeof zEidolonSchema>;
export const zEidolonSchema = z.object({
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
		z.object({
			name: z.string(),
			abilityScores: zAbilityScoreSchema,
			ac: z.object({ number: z.number(), dexCap: z.number() }),
		})
	),
	skills: z.array(z.string()),
	senses: z.object({ other: z.array(z.string()) }),
	languages: z.array(z.string()),
	speed: z.object({ walk: z.number() }),
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
