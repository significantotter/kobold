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
	statGroup = 'statGroup',
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
