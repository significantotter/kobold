import { z } from 'zod';
import { Entry, zEntrySchema } from './lib/entries.zod.js';
import { zActivitySchema, zFrequencySchema } from './lib/helpers.zod.js';

const baseZActionFooterSchema = z.strictObject({
	name: z.string(),
});
export type ActionFooter = z.infer<typeof baseZActionFooterSchema> & { entries: Entry[] };
export const zActionFooterSchema: z.ZodType<ActionFooter> = baseZActionFooterSchema.extend({
	entries: z.lazy(() => zEntrySchema.array()),
});

const baseZActionSchema = z.strictObject({
	name: z.string(),
	alias: z.string().array().optional(),
	source: z.string(),
	activity: zActivitySchema.optional(),
	page: z.number().optional(),
	type: z.literal('action').optional(),
	traits: z.array(z.string()).optional(),
	overcome: z.string().optional(),
	prerequisites: z.string().optional(),
	frequency: zFrequencySchema.optional(),
	add_hash: z.string().optional(),
	actionType: z
		.object({
			basic: z.boolean().optional(),
			variantRule: z.string().array().optional(),
			skill: z
				.object({
					untrained: z.string().array().optional(),
					trained: z.string().array().optional(),
					expert: z.string().array().optional(),
					master: z.string().array().optional(),
					legendary: z.string().array().optional(),
				})
				.optional(),
			class: z.array(z.string()).optional(),
			archetype: z.array(z.string()).optional(),
		})
		.optional(),
	trigger: z.string().optional(),
	cost: z.string().optional(),
	requirements: z.string().optional(),
	special: z.array(z.string()).optional(),
});
export type Action = z.infer<typeof baseZActionSchema> & {
	entries: Entry[];
	info?: Entry[];
	footer?: ActionFooter[];
};
export const zActionSchema: z.ZodType<Action> = baseZActionSchema.extend({
	entries: z.lazy(() => zEntrySchema.array()),
	info: z.lazy(() => zEntrySchema.array()).optional(),
	footer: z.lazy(() => zActionFooterSchema.array()).optional(),
});
