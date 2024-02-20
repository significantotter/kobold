import { z } from 'zod';
import { zActivitySchema, zEntrySchema } from './entries.zod.js';

export type Activate = z.infer<typeof zActivateSchema>;
export const zActivateSchema = z.union([
	z.strictObject({
		activity: zActivitySchema.optional(),
		components: z.array(z.string()).optional(),
		trigger: z.string().optional(),
		requirements: z.string().optional(),
		traits: z.string().array().optional(),
		note: z.string().optional(),
		prerequisites: z.string().optional(),
	}),
	z.null(),
]);

export type VariantModEntry = z.infer<typeof zVariantModEntry>;
const zVariantModEntry = z.strictObject({
	mode: z.string().optional(),
	replaceTags: z.boolean().optional(),
	replace: z.union([z.string(), z.strictObject({ index: z.number() })]).optional(),
	with: z.string().optional(),
	items: z.union([zEntrySchema, zEntrySchema.array()]).optional(),
	joiner: z.string().optional(),
	str: z.string().optional(),
});
export type Mod = z.infer<typeof zModSchema>;
export const zModSchema = z.strictObject({
	entries: z.union([zVariantModEntry, zVariantModEntry.array()]).optional(),
	entriesMode: z.string().optional(),
});

export type Copy = z.infer<typeof zCopySchema>;
export const zCopySchema = z.strictObject({
	name: z.string(),
	source: z.string(),
	_mod: zModSchema.optional(),
});

export type Fluff = z.infer<typeof zFluffSchema>;
export const zFluffSchema = z.strictObject({
	name: z.string(),
	source: z.string(),
	page: z.number().optional(),
	entries: z.array(zEntrySchema).optional(),
	images: z.string().array().optional(),
	lore: z.array(zEntrySchema).optional(),
	_copy: zCopySchema.optional(),
});

export type Heightening = z.infer<typeof zHeighteningSchema>;
export const zHeighteningSchema = z.object({
	plusX: z.record(z.union([z.number(), z.string()]), zEntrySchema.array()).optional(),
	X: z.record(z.union([z.number(), z.string()]), zEntrySchema.array()).optional(),
});
