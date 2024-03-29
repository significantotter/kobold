import { z } from 'zod';

export type SheetAdjustment = z.infer<typeof zSheetAdjustment> & {
	// This is for the parser, keeping type safety as we extend this type
	parsed?: never;
};

export enum SheetAdjustmentTypeEnum {
	untyped = 'untyped',
	status = 'status',
	circumstance = 'circumstance',
	item = 'item',
}

export enum AdjustablePropertyEnum {
	info = 'info',
	infoList = 'infoList',
	intProperty = 'intProperty',
	baseCounter = 'baseCounter',
	weaknessResistance = 'weaknessResistance',
	stat = 'stat',
	attack = 'attack',
	extraSkill = 'extraSkill',
	none = '',
}

export enum SheetAdjustmentOperationEnum {
	'+' = '+',
	'-' = '-',
	'=' = '=',
}

export const zSheetAdjustment = z.strictObject({
	property: z.string(),
	propertyType: z.nativeEnum(AdjustablePropertyEnum),
	operation: z.nativeEnum(SheetAdjustmentOperationEnum),
	value: z.string(),
	type: z.nativeEnum(SheetAdjustmentTypeEnum).default(SheetAdjustmentTypeEnum.untyped),
});

export type Modifier = z.infer<typeof zModifier>;
export const zModifier = z
	.strictObject({
		name: z.string(),
		isActive: z.boolean().default(false),
		description: z.string().nullable().default(null),
		type: z.nativeEnum(SheetAdjustmentTypeEnum).default(SheetAdjustmentTypeEnum.untyped),
		severity: z.number().nullable().default(null),
		sheetAdjustments: z.array(zSheetAdjustment).default([]),
		rollAdjustment: z.coerce.string().nullable().default(null),
		rollTargetTags: z.string().nullable().default(null),
	})
	.describe('A modifier is a bonus or penalty that can be applied to rolls or sheet properties.');
