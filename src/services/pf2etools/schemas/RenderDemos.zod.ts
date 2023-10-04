import { z } from 'zod';
import { zEntrySchema } from './index.js';

export type RenderDemo = z.infer<typeof zRenderDemoSchema>;
export const zRenderDemoSchema = z.strictObject({
	name: z.string(),
	type: z.string(),
	entries: zEntrySchema.array(),
});
