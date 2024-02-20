import { z } from 'zod';
import { zEntrySchema } from './lib/entries.zod.js';

export type RenderDemo = z.infer<typeof zRenderDemoSchema>;
export const zRenderDemoSchema = z.strictObject({
	name: z.string(),
	type: z.string(),
	entries: zEntrySchema.array(),
});
