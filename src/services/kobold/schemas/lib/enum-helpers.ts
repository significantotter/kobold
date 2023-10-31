import {
	ActionTypeEnum,
	ActionCostEnum,
	AbilityEnum,
	AdjustablePropertyEnum,
	SheetAdjustmentOperationEnum,
	SheetAdjustmentTypeEnum,
	SheetStatKeys,
	SheetInfoKeys,
	SheetIntegerKeys,
	SheetInfoListKeys,
	SheetBaseCounterKeys,
	SheetWeaknessesResistancesKeys,
	StatSubGroupEnum,
} from './enums.js';

export function isActionTypeEnum(value: any): value is ActionTypeEnum {
	return value in ActionTypeEnum;
}

export function isActionCostEnum(value: any): value is ActionCostEnum {
	return value in ActionCostEnum;
}

export function isAbilityEnum(value: any): value is AbilityEnum {
	return value in AbilityEnum;
}

export function isAdjustablePropertyEnum(value: any): value is AdjustablePropertyEnum {
	return value in AdjustablePropertyEnum;
}

export function isSheetAdjustmentOperationEnum(value: any): value is SheetAdjustmentOperationEnum {
	return value in SheetAdjustmentOperationEnum;
}

export function isSheetAdjustmentTypeEnum(value: any): value is SheetAdjustmentTypeEnum {
	return value in SheetAdjustmentTypeEnum;
}

export function isSheetStatKeys(value: any): value is SheetStatKeys {
	return value in SheetStatKeys;
}

export function isSheetInfoKeys(value: any): value is SheetInfoKeys {
	return value in SheetInfoKeys;
}

export function isSheetIntegerKeys(value: any): value is SheetIntegerKeys {
	return value in SheetIntegerKeys;
}

export function isSheetInfoListKeys(value: any): value is SheetInfoListKeys {
	return value in SheetInfoListKeys;
}

export function isSheetBaseCounterKeys(value: any): value is SheetBaseCounterKeys {
	return value in SheetBaseCounterKeys;
}

export function isSheetWeaknessesResistancesKeys(
	value: any
): value is SheetWeaknessesResistancesKeys {
	return value in SheetWeaknessesResistancesKeys;
}

export function isStatSubGroupEnum(value: any): value is StatSubGroupEnum {
	return value in StatSubGroupEnum;
}
