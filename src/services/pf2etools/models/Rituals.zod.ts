import { z } from 'zod';
import { zEntrySchema } from './lib/entries.zod.js';
import { zDurationSchema, zTypedNumberSchema } from './lib/helpers.zod.js';

export type Ritual = z.infer<typeof zRitualSchema>;
export const zRitualSchema = z.strictObject({
	name: z.string(),
	source: z.string(),
	page: z.number(),
	level: z.number(),
	traits: z.array(z.string()),
	cast: zTypedNumberSchema,
	cost: z.string().optional(),
	primaryCheck: z.strictObject({
		skills: z.array(z.string()),
		prof: z.string().optional(),
		mustBe: z.array(z.string()).optional(),
		entry: z.string().optional(),
	}),
	requirements: z.string().optional(),
	secondaryCheck: z
		.object({
			skills: z.array(z.string()).optional(),
			prof: z.string().optional(),
			entry: z.string().optional(),
		})
		.optional(),
	secondaryCasters: z
		.object({
			number: z.number(),
			note: z.string().optional(),
			entry: z.string().optional(),
		})
		.optional(),
	targets: z.string().optional(),
	range: z
		.object({
			entry: z.string(),
			type: z.string().optional(),
			distance: z
				.object({
					type: z.string(),
					amount: z.number(),
				})
				.optional(),
		})
		.optional(),
	area: z.strictObject({ types: z.array(z.string()), entry: z.string() }).optional(),
	entries: zEntrySchema.array(),
	duration: zDurationSchema.optional(),
	heightened: z
		.object({
			plusX: z.record(z.union([z.number(), z.string()]), zEntrySchema.array()).optional(),
			X: z.record(z.union([z.number(), z.string()]), zEntrySchema.array()).optional(),
		})
		.optional(),
});
