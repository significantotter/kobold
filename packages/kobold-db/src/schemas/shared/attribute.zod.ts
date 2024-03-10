import { z } from 'zod';

export type Attribute = z.infer<typeof zAttribute>;
export const zAttribute = z.strictObject({
	aliases: z.array(z.string()).default([]),
	name: z.string(),
	type: z.string(),
	value: z.number(),
	tags: z.array(z.string()).default([]),
});
