import { z } from 'zod';

export type OptionalFeature = z.infer<typeof zOptionalFeatureSchema>;
export const zOptionalFeatureSchema = z.strictObject({
	source: z.string(),
	page: z.number(),
	type: z.string(),
	prerequisite: z.array(
		z.strictObject({
			level: z
				.object({
					level: z.number(),
					class: z.strictObject({ name: z.string(), source: z.string() }),
					subclass: z.strictObject({ name: z.string() }),
				})
				.optional(),
			item: z.string().array().optional(),
			feature: z.string().array().optional(),
			feat: z.string().array().optional(),
		})
	),
	traits: z.string().array().optional(),
	name: z.string(),
	add_hash: z.string().optional(),
	entries: z.array(z.string()),
});
