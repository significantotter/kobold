import { z } from 'zod';

export type Group = z.infer<typeof zGroupSchema>;
export const zGroupSchema = z.strictObject({
	name: z.string(),
	type: z.string(),
	source: z.string(),
	page: z.number(),
	specialization: z.array(z.string()),
});
