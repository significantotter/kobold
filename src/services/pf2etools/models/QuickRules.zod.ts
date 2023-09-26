import { z } from 'zod';
import { zEntrySchema } from '../entries.zod.js';

export type QuickRule = z.infer<typeof zQuickRuleSchema>;
export const zQuickRuleSchema = z.record(z.string(), zEntrySchema);
