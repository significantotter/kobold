import { z } from 'zod';
import { zAfflictionEntrySchema } from './index.js';

export type Affliction = z.infer<typeof zAfflictionSchema>;
export const zAfflictionSchema = zAfflictionEntrySchema;
