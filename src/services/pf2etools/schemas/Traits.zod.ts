import { z } from 'zod';
import { zEntrySchema } from './index.js';
import { zOtherSourceSchema } from './index.js';

export type Trait = z.infer<typeof zTraitSchema>;
export const zTraitSchema = z.strictObject({
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
			creature: z.strictObject({ _fimmunities: z.string().array() }).optional(),

			item: z
				.object({
					_fDamageType: z.strictObject({
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
			school: z.strictObject({
				short: z.string(),
				color: z.string(),
			}),
		})
		.optional(),
});
