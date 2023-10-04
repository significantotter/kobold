import { z } from 'zod';
import { zEntrySchema, zOtherSourceSchema, zSpeedSchema } from './index.js';

export type AncestryFeature = z.infer<typeof zAncestryFeatureSchema>;
export const zAncestryFeatureSchema = z.strictObject({
	name: z.string(),
	unarmedAttack: z.boolean().optional(),
	entries: zEntrySchema.array(),
});

export type Heritage = z.infer<typeof zHeritageSchema>;
export const zHeritageSchema = z.strictObject({
	name: z.string(),
	shortName: z.string().optional(),
	traits: z.array(z.string()).optional(),
	source: z.string(),
	page: z.number(),
	info: zEntrySchema.array().optional(),
	entries: zEntrySchema.array().optional(),
	otherSources: zOtherSourceSchema.optional(),
	versatile: z.boolean().optional(),
	rarity: z.string().optional(),
	summary: z
		.strictObject({ text: z.string().optional(), images: z.array(z.string()).optional() })
		.optional(),
});

export type VersatileHeritage = z.infer<typeof zVersatileHeritageSchema>;
export const zVersatileHeritageSchema = zHeritageSchema;

export type Ancestry = z.infer<typeof zAncestrySchema>;
export const zAncestrySchema = z.strictObject({
	name: z.string(),
	source: z.string(),
	otherSources: zOtherSourceSchema.optional(),
	page: z.number(),
	rarity: z.string().optional(),
	hp: z.number(),
	size: z.array(z.string()),
	speed: zSpeedSchema,
	boosts: z.array(z.string()),
	flaw: z.array(z.string()).optional(),
	languages: z.array(z.string()),
	traits: z.array(z.string()),
	features: zAncestryFeatureSchema.array().optional(),
	heritageInfo: z.array(z.string()),
	heritage: z.array(zHeritageSchema),
	flavor: z.array(z.string()),
	info: zEntrySchema.array(),
	miscTags: z.array(z.string()).optional(),
	summary: z.strictObject({ text: z.string().optional(), images: z.array(z.string()) }),
});
