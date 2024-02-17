import { z } from 'zod';

export type CompanionAbility = z.infer<typeof zCompanionAbilitySchema>;
export const zCompanionAbilitySchema = z.strictObject({
	name: z.string(),
	source: z.string(),
	page: z.number(),
	tier: z.number(),
	traits: z.array(z.string()).optional(),
	entries: z.array(z.string()),
});
