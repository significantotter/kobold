import { z } from 'zod';
import { zTableEntrySchema } from '../entries.zod.js';

export type Table = z.infer<typeof zTableSchema>;
export const zTableSchema = zTableEntrySchema.strict();
