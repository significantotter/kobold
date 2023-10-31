import { z } from 'zod';
import {
	AdjustablePropertyEnum,
	SheetAdjustmentOperationEnum,
	SheetAdjustmentTypeEnum,
} from '../../schemas/lib/enums.js';

export type SheetAdjustment = z.infer<typeof zSheetAdjustment> & {
	// This is for the parser, keeping type safety as we extend this type
	parsed?: never;
};

export const zSheetAdjustment = z.strictObject({
	property: z.string(),
	propertyType: z.nativeEnum(AdjustablePropertyEnum),
	operation: z.nativeEnum(SheetAdjustmentOperationEnum),
	value: z.string(),
	type: z.nativeEnum(SheetAdjustmentTypeEnum).default(SheetAdjustmentTypeEnum.untyped),
});

export type SheetModifier = z.infer<typeof zSheetModifier>;
export const zSheetModifier = z
	.strictObject({
		modifierType: z.literal('sheet'),
		name: z.string(),
		isActive: z.boolean().default(false),
		description: z.string().nullable().default(null),
		type: z.nativeEnum(SheetAdjustmentTypeEnum).default(SheetAdjustmentTypeEnum.untyped),
		sheetAdjustments: z.array(zSheetAdjustment).default([]),
	})
	.describe('A sheet modifier. The sheetAdjustments are applied to the sheet.');

export type RollModifier = z.infer<typeof zRollModifier>;
export const zRollModifier = z
	.strictObject({
		modifierType: z.literal('roll'),
		name: z.string(),
		isActive: z.boolean().default(false),
		description: z.string().nullable().default(null),
		type: z.nativeEnum(SheetAdjustmentTypeEnum).default(SheetAdjustmentTypeEnum.untyped),
		value: z.coerce.string(),
		targetTags: z.string().nullable(),
	})
	.describe(
		'A roll modifier. The dice expression in value is assigned ' +
			'the type "type" and appled to rolls that match the targetTags expression'
	);

export type Modifier = z.infer<typeof zModifier>;
export const zModifier = z
	.discriminatedUnion('modifierType', [zSheetModifier, zRollModifier])
	.describe('A modifier is a bonus or penalty that can be applied to a roll or sheet property.');
