import { z } from 'zod';

export type RollMacro = z.infer<typeof zRollMacro>;
export const zRollMacro = z.strictObject({
	name: z.string(),
	macro: z.string(),
});
