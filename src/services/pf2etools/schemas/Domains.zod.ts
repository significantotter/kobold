import { z } from 'zod';

export type Domain = z.infer<typeof zDomainSchema>;
export const zDomainSchema = z.strictObject({
	name: z.string(),
	source: z.string(),
	page: z.number(),
	entries: z.string().array(),
});
