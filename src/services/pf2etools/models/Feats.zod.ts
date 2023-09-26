import { z } from 'zod';
import { Entry, zEntrySchema } from '../entries.zod.js';
import { zOtherSourceSchema, zFrequencySchema, zTypedNumberSchema } from '../helpers.zod.js';

const baseFeatSchema = z.object({
	name: z.string(),
	source: z.string(),
	page: z.number().optional(),
	add_hash: z.union([z.string(), z.string().array()]).optional(),
	activity: zTypedNumberSchema.optional(),
	trigger: z.string().optional(),
	level: z.number(),
	traits: z.string().array(),
	otherSources: zOtherSourceSchema.optional(),
	prerequisites: z.string().optional(),
	access: z.string().optional(),
	requirements: z.string().optional(),
	cost: z.string().optional(),
	frequency: zFrequencySchema.optional(),
	leadsTo: z.string().array().optional(),
	featType: z
		.object({
			archetype: z.union([z.string(), z.string().array()]).optional(),
			skill: z.string().array().optional(),
		})
		.optional(),
	amp: z.object({ entries: zEntrySchema.array() }).optional(),
	footer: z.record(z.string(), z.string()).optional(),
	special: z.union([z.string().array(), z.null()]).optional(),
});
export type Feat = z.infer<typeof baseFeatSchema> & { entries: Entry[] };
export const zFeatSchema: z.ZodType<Feat> = baseFeatSchema
	.extend({
		entries: z.lazy(() => zEntrySchema.array()),
	})
	.strict();
