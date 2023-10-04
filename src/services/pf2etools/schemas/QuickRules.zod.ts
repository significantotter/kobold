import { z } from 'zod';
import { zEntrySchema } from './index.js';

// Special case
// This was originally a record of name: rule
// It's transformed into an array in the model before import
export type QuickRule = z.infer<typeof zQuickRuleSchema>;
export const zQuickRuleSchema = z.strictObject({
	name: z.string(),
	rule: zEntrySchema,
});
