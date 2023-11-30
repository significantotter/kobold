import { z } from 'zod';
import { zTableEntrySchema } from './lib/entries.zod.js';

export type Table = z.infer<typeof zTableSchema>;
export const zTableSchema = zTableEntrySchema.extend({ type: z.literal('table').optional() });
