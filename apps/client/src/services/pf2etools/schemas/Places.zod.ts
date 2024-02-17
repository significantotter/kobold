import { z } from 'zod';

export type Place = z.infer<typeof zPlaceSchema>;
export const zPlaceSchema = z.strictObject({
	name: z.string(),
	source: z.string(),
	page: z.number(),
	category: z.string(),
	level: z.number().optional(),
	traits: z.array(z.string()),
	description: z.string().optional(),
	settlementData: z
		.object({
			government: z.string(),
			population: z.strictObject({
				total: z.number(),
				ancestries: z.record(z.string(), z.number()),
			}),
			languages: z.array(z.string()),
			religions: z.array(z.string()).optional(),
			threats: z.array(z.string()).optional(),
			features: z.array(z.strictObject({ name: z.string(), entries: z.array(z.string()) })),
		})
		.optional(),
	nationData: z
		.object({
			government: z.string(),
			population: z.string().array(),
			languages: z.string().array(),
			religions: z
				.string()
				.or(z.strictObject({ type: z.string(), religions: z.string().array() }))
				.array()
				.optional(),
			threats: z.string().array().optional(),
			features: z
				.array(z.strictObject({ name: z.string(), entries: z.array(z.string()) }))
				.optional(),

			capital: z.strictObject({
				name: z.string(),
				total: z.number(),
			}),
			exports: z.string().array(),
			imports: z.string().array().optional(),
			enemies: z.string().array(),
			factions: z.string().array(),
		})
		.optional(),
	residents: z
		.array(
			z.strictObject({
				name: z.string(),
				alignment: z.string(),
				gender: z.string().optional(),
				ancestry: z.string().optional(),
				position: z.string().optional(),
				level: z.number().optional(),
				bond: z.string(),
			})
		)
		.optional(),
	planeData: z
		.object({
			category: z.string(),
			divinities: z.string().array(),
			inhabitants: z.string().array(),
		})
		.optional(),
	entries: z.array(z.string()).optional(),
});
