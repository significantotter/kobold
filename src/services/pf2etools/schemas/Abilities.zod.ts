import { z } from 'zod';
import { zAbilityEntrySchema } from './index.js';

export type Ability = z.infer<typeof zAbilitySchema>;
export const zAbilitySchema = zAbilityEntrySchema;
