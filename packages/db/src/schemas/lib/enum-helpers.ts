import _ from 'lodash';
import { ActionCostEnum, ActionTypeEnum } from '../shared/action.zod.js';
import {
	AdjustablePropertyEnum,
	SheetAdjustmentOperationEnum,
	SheetAdjustmentTypeEnum,
} from '../shared/sheet-adjustment.zod.js';
import { RollTypeEnum } from '../shared/roll.zod.js';
import {
	AbilityEnum,
	SheetBaseCounterKeys,
	SheetInfoKeys,
	SheetInfoListKeys,
	SheetIntegerKeys,
	SheetStatKeys,
	SheetWeaknessesResistancesKeys,
	StatSubGroupEnum,
} from '../shared/sheet.zod.js';
import { CounterStyleEnum } from '../shared/counter.zod.js';

const actionTypeValueMap = _.keyBy(Object.values(ActionTypeEnum), _.identity);
export function isActionTypeEnum(value: any): value is ActionTypeEnum {
	return actionTypeValueMap[value] !== undefined;
}
const actionCostValueMap = _.keyBy(Object.values(ActionCostEnum), _.identity);
export function isActionCostEnum(value: any): value is ActionCostEnum {
	return actionCostValueMap[value] !== undefined;
}

const abilityValueMap = _.keyBy(Object.values(AbilityEnum), _.identity);
export function isAbilityEnum(value: any): value is AbilityEnum {
	return abilityValueMap[value] !== undefined;
}

const adjustablePropertyValueMap = _.keyBy(Object.values(AdjustablePropertyEnum), _.identity);
export function isAdjustablePropertyEnum(value: any): value is AdjustablePropertyEnum {
	return adjustablePropertyValueMap[value] !== undefined;
}

const sheetAdjustmentOperationValueMap = _.keyBy(
	Object.values(SheetAdjustmentOperationEnum),
	_.identity
);
export function isSheetAdjustmentOperationEnum(value: any): value is SheetAdjustmentOperationEnum {
	return sheetAdjustmentOperationValueMap[value] !== undefined;
}

const sheetAdjustmentTypeValueMap = _.keyBy(Object.values(SheetAdjustmentTypeEnum), _.identity);
export function isSheetAdjustmentTypeEnum(value: any): value is SheetAdjustmentTypeEnum {
	return sheetAdjustmentTypeValueMap[value] !== undefined;
}

const sheetStatKeysValueMap = _.keyBy(Object.values(SheetStatKeys), _.identity);
export function isSheetStatKeys(value: any): value is SheetStatKeys {
	return sheetStatKeysValueMap[value] !== undefined;
}

const sheetInfoKeysValueMap = _.keyBy(Object.values(SheetInfoKeys), _.identity);
export function isSheetInfoKeys(value: any): value is SheetInfoKeys {
	return sheetInfoKeysValueMap[value] !== undefined;
}

const sheetIntegerKeysValueMap = _.keyBy(Object.values(SheetIntegerKeys), _.identity);
export function isSheetIntegerKeys(value: any): value is SheetIntegerKeys {
	return sheetIntegerKeysValueMap[value] !== undefined;
}

const sheetInfoListKeysValueMap = _.keyBy(Object.values(SheetInfoListKeys), _.identity);
export function isSheetInfoListKeys(value: any): value is SheetInfoListKeys {
	return sheetInfoListKeysValueMap[value] !== undefined;
}

const sheetBaseCounterKeysValueMap = _.keyBy(Object.values(SheetBaseCounterKeys), _.identity);
export function isSheetBaseCounterKeys(value: any): value is SheetBaseCounterKeys {
	return sheetBaseCounterKeysValueMap[value] !== undefined;
}

const sheetWeaknessesResistancesKeysValueMap = _.keyBy(
	Object.values(SheetWeaknessesResistancesKeys),
	_.identity
);
export function isSheetWeaknessesResistancesKeys(
	value: any
): value is SheetWeaknessesResistancesKeys {
	return sheetWeaknessesResistancesKeysValueMap[value] !== undefined;
}

const statSubGroupValueMap = _.keyBy(Object.values(StatSubGroupEnum), _.identity);
export function isStatSubGroupEnum(value: any): value is StatSubGroupEnum {
	return statSubGroupValueMap[value] !== undefined;
}

const rollTypeValueMap = _.keyBy(Object.values(RollTypeEnum), _.identity);
export function isRollTypeEnum(value: any): value is RollTypeEnum {
	return rollTypeValueMap[value] !== undefined;
}

const counterStyleValueMap = _.keyBy(Object.values(CounterStyleEnum), _.identity);
export function isCounterStyleEnum(value: any): value is CounterStyleEnum {
	return counterStyleValueMap[value] !== undefined;
}

/** User Settings Enums - Re-exported from database-enums.ts */
export {
	TrackerModeEnum,
	ImportSourceEnum,
	InitStatsNotificationEnum,
	RollCompactModeEnum,
	InlineRollsDisplayEnum,
	DefaultCompendiumEnum,
	GameSystemEnum,
} from './database-enums.js';

import {
	InitStatsNotificationEnum,
	RollCompactModeEnum,
	InlineRollsDisplayEnum,
	DefaultCompendiumEnum,
	GameSystemEnum,
} from './database-enums.js';

const initStatsNotificationValueMap = _.keyBy(Object.values(InitStatsNotificationEnum), _.identity);
export function isInitStatsNotificationEnum(value: any): value is InitStatsNotificationEnum {
	return initStatsNotificationValueMap[value] !== undefined;
}

const rollCompactModeValueMap = _.keyBy(Object.values(RollCompactModeEnum), _.identity);
export function isRollCompactModeEnum(value: any): value is RollCompactModeEnum {
	return rollCompactModeValueMap[value] !== undefined;
}

const defaultCompendiumValueMap = _.keyBy(Object.values(DefaultCompendiumEnum), _.identity);
export function isDefaultCompendiumEnum(value: any): value is DefaultCompendiumEnum {
	return defaultCompendiumValueMap[value] !== undefined;
}

const inlineRollsDisplayValueMap = _.keyBy(Object.values(InlineRollsDisplayEnum), _.identity);
export function isInlineRollsDisplayEnum(value: any): value is InlineRollsDisplayEnum {
	return inlineRollsDisplayValueMap[value] !== undefined;
}

const gameSystemValueMap = _.keyBy(Object.values(GameSystemEnum), _.identity);
export function isGameSystemEnum(value: any): value is GameSystemEnum {
	return gameSystemValueMap[value] !== undefined;
}
