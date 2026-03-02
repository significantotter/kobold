import { z } from 'zod';
import { SheetAdjustmentTypeEnum, zSheetAdjustment } from './sheet-adjustment.zod.js';

/**
 * A Condition is a modifier-like object that is not persisted to the database.
 * It lacks `id` and `sheetRecordId` since it's not tied to a specific sheet record.
 * Conditions are typically applied temporarily to a character (e.g., frightened, sickened).
 */
export const zCondition = z.object({
	description: z.string().nullable().optional(),
	isActive: z.boolean().default(true),
	name: z.string(),
	note: z.string().nullable().optional(),
	rollAdjustment: z.string().nullable().optional(),
	rollTargetTags: z.string().nullable().optional(),
	severity: z.number().nullable().optional(),
	sheetAdjustments: z.array(zSheetAdjustment).default([]),
	type: z.enum(SheetAdjustmentTypeEnum).default(SheetAdjustmentTypeEnum.untyped),
});

export type Condition = z.infer<typeof zCondition>;
