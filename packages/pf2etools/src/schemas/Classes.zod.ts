import { z } from 'zod';
import { zEntrySchema } from './lib/entries.zod.js';

const zProficiencyCategorySchema = z.strictObject({
	t: z.array(z.string()).optional(),
	e: z.array(z.string()).optional(),
	u: z.string().array().optional(),
});

export type Class = z.infer<typeof zClassSchema>;
export const zClassSchema = z.strictObject({
	name: z.string(),
	source: z.string(),
	page: z.number(),
	keyAbility: z.string(),
	hp: z.number(),
	initialProficiencies: z.strictObject({
		perception: z.string(),
		fort: z.string(),
		ref: z.string(),
		will: z.string(),
		skills: z.strictObject({
			t: z
				.array(
					z.strictObject({
						skill: z.array(z.string()),
						entry: z.string().optional(),
						type: z.string().optional(),
					})
				)
				.optional(),
			add: z.number(),
		}),
		spells: zProficiencyCategorySchema.optional(),
		attacks: zProficiencyCategorySchema,
		defenses: zProficiencyCategorySchema,
		classDc: z.strictObject({ prof: z.string(), entry: z.string() }).optional(),
	}),
	advancement: z
		.strictObject({
			classFeats: z.array(z.number()),
			skillFeats: z.array(z.number()),
			generalFeats: z.array(z.number()),
			ancestryFeats: z.array(z.number()),
			skillIncrease: z.array(z.number()),
			abilityBoosts: z.array(z.number()),
		})
		.catchall(
			z.array(z.number()).or(
				z.strictObject({
					name: z.string(),
					entry: z.string(),
					levels: z.number().array(),
				})
			)
		),
	classFeatures: z.array(
		z.union([
			z.string(),
			z.strictObject({ classFeature: z.string(), gainSubclassFeature: z.boolean() }),
		])
	),
	subclasses: z.array(
		z.strictObject({
			name: z.string(),
			type: z.string(),
			shortName: z.string(),
			source: z.string(),
			page: z.number(),
			subclassFeatures: z.array(z.string()),
		})
	),
	classFeaturesIntro: z
		.array(
			z.strictObject({
				type: z.string(),
				page: z.number(),
				name: z.string(),
				entries: z.array(z.string()),
			})
		)
		.optional(),
	flavor: z.array(z.string()),
	fluff: z.array(zEntrySchema),
	summary: z.strictObject({
		text: z.string().optional(),
		images: z.array(z.string()),
		keyAbility: z.string(),
		sndAbility: z.string().optional(),
	}),
	rarity: z.string().optional(),
	sampleBuilds: z
		.array(
			z.strictObject({
				name: z.string(),
				source: z.string(),
				page: z.number(),
				entries: z.array(z.string()),
				abilities: z.array(z.string()),
				skills: z.array(z.string()),
				subclass: z.string(),
				feats: z.array(z.string()),
			})
		)
		.optional(),
});
