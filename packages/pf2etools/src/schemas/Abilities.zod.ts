import { z } from 'zod';
import { zAbilityEntrySchema } from './lib/entries.zod.js';

export type Ability = z.infer<typeof zAbilitySchema>;
export const zAbilitySchema = zAbilityEntrySchema;
