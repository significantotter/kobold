import { z } from 'zod';

export type Class = z.infer<typeof zClassSchema>;
export const zClassSchema = z.object({
	name: z.string(),
	source: z.string(),
	page: z.number(),
	keyAbility: z.string(),
	hp: z.number(),
	initialProficiencies: z.object({
		perception: z.string(),
		fort: z.string(),
		ref: z.string(),
		will: z.string(),
		skills: z.object({
			t: z.array(z.object({ skill: z.array(z.string()) })),
			add: z.number(),
		}),
		attacks: z.object({ t: z.array(z.string()) }),
		defenses: z.object({ t: z.array(z.string()) }),
		classDc: z.object({ prof: z.string(), entry: z.string() }),
	}),
	advancement: z.object({
		classFeats: z.array(z.number()),
		skillFeats: z.array(z.number()),
		generalFeats: z.array(z.number()),
		ancestryFeats: z.array(z.number()),
		skillIncrease: z.array(z.number()),
		abilityBoosts: z.array(z.number()),
	}),
	classFeatures: z.array(
		z.union([
			z.string(),
			z.object({ classFeature: z.string(), gainSubclassFeature: z.boolean() }),
		])
	),
	subclasses: z.array(
		z.object({
			name: z.string(),
			type: z.string(),
			shortName: z.string(),
			source: z.string(),
			page: z.number(),
			subclassFeatures: z.array(z.string()),
		})
	),
	classFeaturesIntro: z.array(
		z.object({
			type: z.string(),
			page: z.number(),
			name: z.string(),
			entries: z.array(z.string()),
		})
	),
	flavor: z.array(z.string()),
	fluff: z.array(
		z.union([
			z.object({
				type: z.string(),
				page: z.number(),
				name: z.string(),
				entries: z.array(z.string()),
			}),
			z.object({
				type: z.string(),
				page: z.number(),
				name: z.string(),
				entries: z.array(z.object({ type: z.string(), items: z.array(z.string()) })),
			}),
		])
	),
	summary: z.object({ images: z.array(z.string()), keyAbility: z.string() }),
});
