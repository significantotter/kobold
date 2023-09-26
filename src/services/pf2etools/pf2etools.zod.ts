import { z } from 'zod';
import { Entry, zAbilityEntrySchema, zAfflictionEntrySchema, zEntrySchema } from './entries.zod.js';
import {
	zActivateSchema,
	zActivitySchema,
	zDuration,
	zFrequencySchema,
	zOtherSourceSchema,
	zPriceSchema,
	zWeaponDataSchema,
} from './helpers.zod.js';
