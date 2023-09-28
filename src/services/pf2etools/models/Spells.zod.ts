import { z } from 'zod';
import { zEntrySchema } from './lib/entries.zod.js';
import { zOtherSourceSchema, zDurationSchema, zTypedNumberSchema } from './lib/helpers.zod.js';

export type Spell = z.infer<typeof zSpellSchema>;
export const zSpellSchema = z
	.object({
		name: z.string(),
		alias: z.union([z.string(), z.string().array()]).optional(),
		source: z.string(),
		page: z.number(),
		focus: z.boolean().optional(),
		level: z.number(),
		traits: z.array(z.string()),
		miscTags: z.array(z.string()).optional(),
		traditions: z.string().array().optional(),
		spellLists: z.string().array().optional(),
		domains: z.string().array().optional(),
		subclass: z.record(z.string(), z.array(z.string())).optional(),
		otherSources: zOtherSourceSchema.optional(),
		cast: zTypedNumberSchema.extend({
			entry: zEntrySchema.optional(),
		}),
		components: z.array(z.array(z.string())).optional(),
		requirements: z.string().optional(),
		trigger: z.string().optional(),
		area: z.object({ types: z.array(z.string()), entry: z.string() }).optional(),
		range: zTypedNumberSchema.optional(),
		targets: z.string().optional(),
		savingThrow: z.object({ type: z.array(z.string()) }).optional(),
		duration: zDurationSchema.optional(),
		cost: z.string().optional(),
		entries: zEntrySchema.array(),
		heightened: z
			.object({
				plusX: z.record(z.union([z.number(), z.string()]), zEntrySchema.array()).optional(),
				X: z.record(z.union([z.number(), z.string()]), zEntrySchema.array()).optional(),
			})
			.optional(),
		amp: z.object({ entries: zEntrySchema.array() }).optional(),
	})
	.strict();
