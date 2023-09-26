import { z } from 'zod';

export type Place = z.infer<typeof zPlaceSchema>;
export const zPlaceSchema = z
	.object({
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
				population: z.object({
					total: z.number(),
					ancestries: z.record(z.string(), z.number()),
				}),
				languages: z.array(z.string()),
				religions: z.array(z.string()).optional(),
				threats: z.array(z.string()).optional(),
				features: z.array(z.object({ name: z.string(), entries: z.array(z.string()) })),
			})
			.optional(),
		nationData: z
			.object({
				government: z.string(),
				capital: z.object({
					name: z.string(),
					total: z.number(),
				}),
				population: z.string().array(),
				languages: z.string().array(),
				religions: z
					.string()
					.or(z.object({ type: z.string(), religions: z.string().array() }))
					.array()
					.optional(),
				exports: z.string().array(),
				imports: z.string().array().optional(),
				enemies: z.string().array(),
				factions: z.string().array(),
				threats: z.string().array().optional(),
				features: z
					.array(z.object({ name: z.string(), entries: z.array(z.string()) }))
					.optional(),
			})
			.optional(),
		residents: z
			.array(
				z.object({
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
	})
	.strict();
