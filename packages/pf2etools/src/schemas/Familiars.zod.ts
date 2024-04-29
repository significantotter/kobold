import { z } from 'zod';
import { zAbilityEntrySchema } from './lib/entries.zod.js';

export type Familiar = z.infer<typeof zFamiliarSchema>;
export const zFamiliarSchema = z.strictObject({
	name: z.string(),
	source: z.string(),
	page: z.number(),
	type: z.string(),
	traits: z.array(z.string()),
	access: z.string().optional(),
	requires: z.number(),
	granted: z.array(z.string()).optional(),
	abilities: z.array(zAbilityEntrySchema),
	fluff: z.array(z.string()),
	alignment: z.string().optional(),
});
