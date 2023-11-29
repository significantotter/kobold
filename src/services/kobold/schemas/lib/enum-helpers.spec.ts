import {
	AbilityEnum,
	ActionCostEnum,
	ActionTypeEnum,
	AdjustablePropertyEnum,
	ModifierTypeEnum,
	RollTypeEnum,
	SheetAdjustmentOperationEnum,
	SheetAdjustmentTypeEnum,
	SheetBaseCounterKeys,
	SheetInfoKeys,
	SheetInfoListKeys,
	SheetIntegerKeys,
	SheetRecordTrackerModeEnum,
	SheetStatKeys,
	SheetWeaknessesResistancesKeys,
	StatSubGroupEnum,
} from '../index.js';
import {
	isActionTypeEnum,
	isActionCostEnum,
	isAbilityEnum,
	isAdjustablePropertyEnum,
	InlineRollsDisplayEnum,
	RollCompactModeEnum,
	isInlineRollsDisplayEnum,
	isModifierTypeEnum,
	isRollCompactModeEnum,
	isRollTypeEnum,
	isSheetAdjustmentOperationEnum,
	isSheetAdjustmentTypeEnum,
	isSheetBaseCounterKeys,
	isSheetInfoKeys,
	isSheetInfoListKeys,
	isSheetIntegerKeys,
	isSheetStatKeys,
	isSheetWeaknessesResistancesKeys,
	isStatSubGroupEnum,
	isInitStatsNotificationEnum,
	InitStatsNotificationEnum,
	isSheetRecordTrackerModeEnum,
} from './enum-helpers.js';

describe('Enum Helpers', () => {
	describe('isActionTypeEnum', () => {
		it('should return true for valid ActionTypeEnum values', () => {
			expect(isActionTypeEnum(ActionTypeEnum.attack)).toBe(true);
			expect(isActionTypeEnum(ActionTypeEnum.other)).toBe(true);
			expect(isActionTypeEnum(ActionTypeEnum.spell)).toBe(true);
		});

		it('should return false for invalid ActionTypeEnum values', () => {
			expect(isActionTypeEnum('invalid_value')).toBe(false);
		});
	});

	describe('isActionCostEnum', () => {
		it('should return true for valid ActionCostEnum values', () => {
			expect(isActionCostEnum(ActionCostEnum.freeAction)).toBe(true);
			expect(isActionCostEnum(ActionCostEnum.none)).toBe(true);
			expect(isActionCostEnum(ActionCostEnum.oneAction)).toBe(true);
			expect(isActionCostEnum(ActionCostEnum.reaction)).toBe(true);
			expect(isActionCostEnum(ActionCostEnum.threeActions)).toBe(true);
			expect(isActionCostEnum(ActionCostEnum.twoActions)).toBe(true);
			expect(isActionCostEnum(ActionCostEnum.variableActions)).toBe(true);
		});

		it('should return false for invalid ActionCostEnum values', () => {
			expect(isActionCostEnum('invalid_value')).toBe(false);
		});
	});

	describe('isAbilityEnum', () => {
		it('should return true for valid AbilityEnum values', () => {
			expect(isAbilityEnum(AbilityEnum.strength)).toBe(true);
			expect(isAbilityEnum(AbilityEnum.dexterity)).toBe(true);
			expect(isAbilityEnum(AbilityEnum.constitution)).toBe(true);
			expect(isAbilityEnum(AbilityEnum.intelligence)).toBe(true);
			expect(isAbilityEnum(AbilityEnum.wisdom)).toBe(true);
			expect(isAbilityEnum(AbilityEnum.charisma)).toBe(true);
		});

		it('should return false for invalid AbilityEnum values', () => {
			expect(isAbilityEnum('invalid_value')).toBe(false);
		});
	});

	describe('isAdjustablePropertyEnum', () => {
		it('should return true for valid AdjustablePropertyEnum values', () => {
			expect(isAdjustablePropertyEnum(AdjustablePropertyEnum.attack)).toBe(true);
			expect(isAdjustablePropertyEnum(AdjustablePropertyEnum.baseCounter)).toBe(true);
			expect(isAdjustablePropertyEnum(AdjustablePropertyEnum.extraSkill)).toBe(true);
			expect(isAdjustablePropertyEnum(AdjustablePropertyEnum.info)).toBe(true);
			expect(isAdjustablePropertyEnum(AdjustablePropertyEnum.infoList)).toBe(true);
			expect(isAdjustablePropertyEnum(AdjustablePropertyEnum.intProperty)).toBe(true);
			expect(isAdjustablePropertyEnum(AdjustablePropertyEnum.none)).toBe(true);
			expect(isAdjustablePropertyEnum(AdjustablePropertyEnum.stat)).toBe(true);
			expect(isAdjustablePropertyEnum(AdjustablePropertyEnum.weaknessResistance)).toBe(true);
		});

		it('should return false for invalid AdjustablePropertyEnum values', () => {
			expect(isAdjustablePropertyEnum('invalid_value')).toBe(false);
		});
	});

	describe('isSheetAdjustmentOperationEnum', () => {
		it('should return true for valid SheetAdjustmentOperationEnum values', () => {
			expect(isSheetAdjustmentOperationEnum(SheetAdjustmentOperationEnum['+'])).toBe(true);
			expect(isSheetAdjustmentOperationEnum(SheetAdjustmentOperationEnum['-'])).toBe(true);
			expect(isSheetAdjustmentOperationEnum(SheetAdjustmentOperationEnum['='])).toBe(true);
		});

		it('should return false for invalid SheetAdjustmentOperationEnum values', () => {
			expect(isSheetAdjustmentOperationEnum('invalid_value')).toBe(false);
		});
	});

	describe('isSheetRecordTrackerModeEnum', () => {
		it('should return true for valid SheetRecordTrackerModeEnum values', () => {
			expect(isSheetRecordTrackerModeEnum(SheetRecordTrackerModeEnum.counters_only)).toBe(
				true
			);
			expect(isSheetRecordTrackerModeEnum(SheetRecordTrackerModeEnum.basic_stats)).toBe(true);
			expect(isSheetRecordTrackerModeEnum(SheetRecordTrackerModeEnum.full_sheet)).toBe(true);
		});

		it('should return false for invalid SheetRecordTrackerModeEnum values', () => {
			expect(isSheetRecordTrackerModeEnum('invalid_value')).toBe(false);
		});
	});

	describe('isSheetAdjustmentTypeEnum', () => {
		it('should return true for valid SheetAdjustmentTypeEnum values', () => {
			expect(isSheetAdjustmentTypeEnum(SheetAdjustmentTypeEnum.circumstance)).toBe(true);
			expect(isSheetAdjustmentTypeEnum(SheetAdjustmentTypeEnum.item)).toBe(true);
			expect(isSheetAdjustmentTypeEnum(SheetAdjustmentTypeEnum.status)).toBe(true);
			expect(isSheetAdjustmentTypeEnum(SheetAdjustmentTypeEnum.untyped)).toBe(true);
		});

		it('should return false for invalid SheetAdjustmentTypeEnum values', () => {
			expect(isSheetAdjustmentTypeEnum('invalid_value')).toBe(false);
		});
	});

	describe('isSheetStatKeys', () => {
		it('should return true for valid SheetStatKeys values', () => {
			expect(isSheetStatKeys(SheetStatKeys.acrobatics)).toBe(true);
			expect(isSheetStatKeys(SheetStatKeys.class)).toBe(true);
			expect(isSheetStatKeys(SheetStatKeys.will)).toBe(true);
			expect(isSheetStatKeys(SheetStatKeys.primal)).toBe(true);
		});

		it('should return false for invalid SheetStatKeys values', () => {
			expect(isSheetStatKeys('invalid_value')).toBe(false);
		});
	});

	describe('isSheetInfoKeys', () => {
		it('should return true for valid SheetInfoKeys values', () => {
			expect(isSheetInfoKeys(SheetInfoKeys.age)).toBe(true);
			expect(isSheetInfoKeys(SheetInfoKeys.deity)).toBe(true);
			expect(isSheetInfoKeys(SheetInfoKeys.imageURL)).toBe(true);
			expect(isSheetInfoKeys(SheetInfoKeys.ancestry)).toBe(true);
		});

		it('should return false for invalid SheetInfoKeys values', () => {
			expect(isSheetInfoKeys('invalid_value')).toBe(false);
		});
	});

	describe('isSheetIntegerKeys', () => {
		it('should return true for valid SheetIntegerKeys values', () => {
			expect(isSheetIntegerKeys(SheetIntegerKeys.ac)).toBe(true);
			expect(isSheetIntegerKeys(SheetIntegerKeys.burrowSpeed)).toBe(true);
			expect(isSheetIntegerKeys(SheetIntegerKeys.constitution)).toBe(true);
			expect(isSheetIntegerKeys(SheetIntegerKeys.heavyProficiency)).toBe(true);
			expect(isSheetIntegerKeys(SheetIntegerKeys.simpleProficiency)).toBe(true);
		});

		it('should return false for invalid SheetIntegerKeys values', () => {
			expect(isSheetIntegerKeys('invalid_value')).toBe(false);
		});
	});

	describe('isSheetInfoListKeys', () => {
		it('should return true for valid SheetInfoListKeys values', () => {
			expect(isSheetInfoListKeys(SheetInfoListKeys.immunities)).toBe(true);
			expect(isSheetInfoListKeys(SheetInfoListKeys.languages)).toBe(true);
			expect(isSheetInfoListKeys(SheetInfoListKeys.senses)).toBe(true);
			expect(isSheetInfoListKeys(SheetInfoListKeys.traits)).toBe(true);
		});

		it('should return false for invalid SheetInfoListKeys values', () => {
			expect(isSheetInfoListKeys('invalid_value')).toBe(false);
		});
	});

	describe('isSheetBaseCounterKeys', () => {
		it('should return true for valid SheetBaseCounterKeys values', () => {
			expect(isSheetBaseCounterKeys(SheetBaseCounterKeys.focusPoints)).toBe(true);
			expect(isSheetBaseCounterKeys(SheetBaseCounterKeys.heroPoints)).toBe(true);
			expect(isSheetBaseCounterKeys(SheetBaseCounterKeys.hp)).toBe(true);
			expect(isSheetBaseCounterKeys(SheetBaseCounterKeys.resolve)).toBe(true);
			expect(isSheetBaseCounterKeys(SheetBaseCounterKeys.stamina)).toBe(true);
			expect(isSheetBaseCounterKeys(SheetBaseCounterKeys.tempHp)).toBe(true);
		});

		it('should return false for invalid SheetBaseCounterKeys values', () => {
			expect(isSheetBaseCounterKeys('invalid_value')).toBe(false);
		});
	});

	describe('isSheetWeaknessesResistancesKeys', () => {
		it('should return true for valid SheetWeaknessesResistancesKeys values', () => {
			expect(
				isSheetWeaknessesResistancesKeys(SheetWeaknessesResistancesKeys.resistances)
			).toBe(true);
			expect(
				isSheetWeaknessesResistancesKeys(SheetWeaknessesResistancesKeys.weaknesses)
			).toBe(true);
		});

		it('should return false for invalid SheetWeaknessesResistancesKeys values', () => {
			expect(isSheetWeaknessesResistancesKeys('invalid_value')).toBe(false);
		});
	});

	describe('isStatSubGroupEnum', () => {
		it('should return true for valid StatSubGroupEnum values', () => {
			expect(isStatSubGroupEnum(StatSubGroupEnum.ability)).toBe(true);
			expect(isStatSubGroupEnum(StatSubGroupEnum.bonus)).toBe(true);
			expect(isStatSubGroupEnum(StatSubGroupEnum.dc)).toBe(true);
			expect(isStatSubGroupEnum(StatSubGroupEnum.proficiency)).toBe(true);
		});

		it('should return false for invalid StatSubGroupEnum values', () => {
			expect(isStatSubGroupEnum('invalid_value')).toBe(false);
		});
	});

	describe('isRollTypeEnum', () => {
		it('should return true for valid RollTypeEnum values', () => {
			expect(isRollTypeEnum(RollTypeEnum.advancedDamage)).toBe(true);
			expect(isRollTypeEnum(RollTypeEnum.attack)).toBe(true);
			expect(isRollTypeEnum(RollTypeEnum.damage)).toBe(true);
			expect(isRollTypeEnum(RollTypeEnum.save)).toBe(true);
			expect(isRollTypeEnum(RollTypeEnum.skillChallenge)).toBe(true);
			expect(isRollTypeEnum(RollTypeEnum.text)).toBe(true);
		});

		it('should return false for invalid RollTypeEnum values', () => {
			expect(isRollTypeEnum('invalid_value')).toBe(false);
		});
	});

	describe('isModifierTypeEnum', () => {
		it('should return true for valid ModifierTypeEnum values', () => {
			expect(isModifierTypeEnum(ModifierTypeEnum.roll)).toBe(true);
			expect(isModifierTypeEnum(ModifierTypeEnum.sheet)).toBe(true);
		});

		it('should return false for invalid ModifierTypeEnum values', () => {
			expect(isModifierTypeEnum('invalid_value')).toBe(false);
		});
	});

	describe('isInitStatsNotificationEnum', () => {
		it('should return true for valid InitStatsNotificationEnum values', () => {
			expect(isInitStatsNotificationEnum(InitStatsNotificationEnum.never)).toBe(true);
			expect(isInitStatsNotificationEnum(InitStatsNotificationEnum.every_round)).toBe(true);
			expect(isInitStatsNotificationEnum(InitStatsNotificationEnum.every_turn)).toBe(true);
			expect(isInitStatsNotificationEnum(InitStatsNotificationEnum.whenever_hidden)).toBe(
				true
			);
		});

		it('should return false for invalid InitStatsNotificationEnum values', () => {
			expect(isInitStatsNotificationEnum('invalid_value')).toBe(false);
		});
	});

	describe('isRollCompactModeEnum', () => {
		it('should return true for valid RollCompactModeEnum values', () => {
			expect(isRollCompactModeEnum(RollCompactModeEnum.compact)).toBe(true);
			expect(isRollCompactModeEnum(RollCompactModeEnum.normal)).toBe(true);
		});

		it('should return false for invalid RollCompactModeEnum values', () => {
			expect(isRollCompactModeEnum('invalid_value')).toBe(false);
		});
	});

	describe('isInlineRollsDisplayEnum', () => {
		it('should return true for valid InlineRollsDisplayEnum values', () => {
			expect(isInlineRollsDisplayEnum(InlineRollsDisplayEnum.compact)).toBe(true);
			expect(isInlineRollsDisplayEnum(InlineRollsDisplayEnum.detailed)).toBe(true);
		});

		it('should return false for invalid InlineRollsDisplayEnum values', () => {
			expect(isInlineRollsDisplayEnum('invalid_value')).toBe(false);
		});
	});
});
