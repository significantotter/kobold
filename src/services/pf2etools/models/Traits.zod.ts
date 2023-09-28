import { z } from 'zod';
import { zEntrySchema } from './lib/entries.zod.js';
import { zOtherSourceSchema } from './lib/helpers.zod.js';

export type Trait = z.infer<typeof zTraitSchema>;
export const zTraitSchema = z
	.object({
		name: z.string(),
		alias: z.string().or(z.string().array()).optional(),
		variable: z.boolean().optional(),
		source: z.string(),
		page: z.number(),
		otherSources: zOtherSourceSchema.optional(),
		categories: z.array(z.string()).optional(),
		entries: zEntrySchema.array(),
		implies: z
			.object({
				spell: z
					.object({
						_fSchool: z.string(),
					})
					.optional(),
				creature: z.object({ _fimmunities: z.string().array() }).optional(),

				item: z
					.object({
						_fDamageType: z.object({
							regex: z.string(),
							flags: z.string(),
							value: z.string(),
						}),
					})
					.optional(),
			})
			.optional(),
		_data: z
			.object({
				school: z.object({
					short: z.string(),
					color: z.string(),
				}),
			})
			.optional(),
	})
	.strict();
