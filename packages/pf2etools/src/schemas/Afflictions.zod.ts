import { z } from 'zod';
import { zAfflictionEntrySchema } from './lib/entries.zod.js';

export type Affliction = z.infer<typeof zAfflictionSchema>;
export const zAfflictionSchema = zAfflictionEntrySchema;
