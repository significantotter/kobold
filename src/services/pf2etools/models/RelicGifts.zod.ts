import { z } from 'zod';
import { zEntrySchema } from '../entries.zod.js';
import { zFrequencySchema } from '../helpers.zod.js';

export type RelicGift = z.infer<typeof zRelicGiftSchema>;
export const zRelicGiftSchema = z
	.object({
		name: z.string(),
		add_hash: z.string().optional(),
		source: z.string(),
		page: z.number(),
		tier: z.string(),
		traits: z.array(z.string()),
		aspects: z.array(z.string().or(z.object({ name: z.string(), note: z.string() }))),
		prerequisites: z.string().optional(),
		entries: zEntrySchema.array(),
		miscTags: z.array(z.string()),
		itemTypes: z.array(z.string()).optional(),
		frequency: zFrequencySchema.optional(),
	})
	.strict();
