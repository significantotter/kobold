import _ from 'lodash';
import {
	AbilityEnum,
	AdjustablePropertyEnum,
	SheetAdjustment,
	SheetAdjustmentOperationEnum,
	SheetAdjustmentTypeEnum,
	SheetStatKeys,
	StatSubGroupEnum,
} from '@kobold/db';
import { KoboldError } from '../KoboldError.js';
import {
	SheetAttackAdjustment,
	SheetExtraSkillAdjustment,
	SheetInfoAdjustment,
	SheetInfoListAdjustment,
	SheetIntegerAdjustment,
	SheetStatAdjustment,
} from './sheet-adjuster.js';
import {
	AttackBucket,
	ExtraSkillBucket,
	SheetInfoBucket,
	SheetInfoListsBucket,
	SheetIntegerPropertyBucket,
	SheetPropertyGroupBucket,
	StatBucket,
	WeaknessResistanceBucket,
} from './sheet-adjustment-bucketer.js';

class TestSheetPropertyGroupBucket extends SheetPropertyGroupBucket<SheetAdjustment> {
	public serialize(adjustment: SheetAdjustment): SheetAdjustment {
		return adjustment;
	}
	public deserialize(adjustment: SheetAdjustment): SheetAdjustment {
		return adjustment;
	}
	public discardAdjustment(adjustment: SheetAdjustment): boolean {
		return adjustment.value === 'discard';
	}

	public combine(
		currentAdjustment: SheetAdjustment,
		newAdjustment: SheetAdjustment
	): SheetAdjustment {
		return {
			...currentAdjustment,
			value: currentAdjustment.value + newAdjustment.value,
		};
	}
	public combineSameType = this.combine.bind(this);
}

describe('SheetPropertyGroupBucket', () => {
	let sheetPropertyGroupBucket: TestSheetPropertyGroupBucket;

	beforeEach(() => {
		sheetPropertyGroupBucket = new TestSheetPropertyGroupBucket();
	});

	describe('sortToBucket', () => {
		it('should add an adjustment to the correct bucket', () => {
			const adjustment: SheetAdjustment = {
				type: SheetAdjustmentTypeEnum.status,
				propertyType: AdjustablePropertyEnum.intProperty,
				operation: SheetAdjustmentOperationEnum['+'],
				property: AbilityEnum.strength,
				value: '10',
			};
			sheetPropertyGroupBucket.sortToBucket(adjustment);
			expect(sheetPropertyGroupBucket.buckets).toEqual({
				strength: {
					status: {
						[SheetAdjustmentOperationEnum['+']]: {
							type: SheetAdjustmentTypeEnum.status,
							propertyType: AdjustablePropertyEnum.intProperty,
							operation: SheetAdjustmentOperationEnum['+'],
							property: AbilityEnum.strength,
							value: '10',
						},
					},
				},
			});
		});
		it('should add new adjustment to bucket if bucket is empty', () => {
			const adjustment: SheetAdjustment = {
				propertyType: AdjustablePropertyEnum.info,
				type: SheetAdjustmentTypeEnum.untyped,
				property: 'name',
				operation: SheetAdjustmentOperationEnum['='],
				value: 'Alice',
			};
			sheetPropertyGroupBucket.sortToBucket(adjustment);
			expect(sheetPropertyGroupBucket.buckets).toEqual({
				name: { untyped: { [SheetAdjustmentOperationEnum['=']]: adjustment } },
			});
		});

		it('should combine adjustments if bucket already has an adjustment for the property', () => {
			const currentAdjustment: SheetAdjustment = {
				propertyType: AdjustablePropertyEnum.none,
				type: SheetAdjustmentTypeEnum.untyped,
				property: 'name',
				operation: SheetAdjustmentOperationEnum['+'],
				value: 'Alice',
			};
			const newAdjustment: SheetAdjustment = {
				propertyType: AdjustablePropertyEnum.none,
				type: SheetAdjustmentTypeEnum.untyped,
				property: 'name',
				operation: SheetAdjustmentOperationEnum['+'],
				value: 'Bob',
			};
			sheetPropertyGroupBucket.sortToBucket(currentAdjustment);
			sheetPropertyGroupBucket.sortToBucket(newAdjustment);
			expect(sheetPropertyGroupBucket.buckets).toEqual({
				name: {
					untyped: {
						[SheetAdjustmentOperationEnum['+']]: {
							propertyType: AdjustablePropertyEnum.none,
							type: SheetAdjustmentTypeEnum.untyped,
							property: 'name',
							operation: SheetAdjustmentOperationEnum['+'],
							value: 'AliceBob',
						},
					},
				},
			});
		});
		it('should discard adjustments instead of adding if discardAdjustment returns true', () => {
			const currentAdjustment: SheetAdjustment = {
				propertyType: AdjustablePropertyEnum.none,
				type: SheetAdjustmentTypeEnum.untyped,
				property: 'name',
				operation: SheetAdjustmentOperationEnum['+'],
				value: 'Alice',
			};
			const newAdjustment: SheetAdjustment = {
				propertyType: AdjustablePropertyEnum.none,
				type: SheetAdjustmentTypeEnum.untyped,
				property: 'name',
				operation: SheetAdjustmentOperationEnum['+'],
				value: 'discard',
			};
			sheetPropertyGroupBucket.sortToBucket(currentAdjustment);
			sheetPropertyGroupBucket.sortToBucket(newAdjustment);
			expect(sheetPropertyGroupBucket.buckets).toEqual({
				name: {
					untyped: {
						[SheetAdjustmentOperationEnum['+']]: {
							propertyType: AdjustablePropertyEnum.none,
							type: SheetAdjustmentTypeEnum.untyped,
							property: 'name',
							operation: SheetAdjustmentOperationEnum['+'],
							value: 'Alice',
						},
					},
				},
			});
		});

		describe('reduceBuckets', () => {
			it('should reduce the buckets to an array of adjustments', () => {
				sheetPropertyGroupBucket.buckets = {
					strength: {
						status: {
							[SheetAdjustmentOperationEnum['+']]: {
								type: SheetAdjustmentTypeEnum.status,
								propertyType: AdjustablePropertyEnum.intProperty,
								operation: SheetAdjustmentOperationEnum['+'],
								property: AbilityEnum.strength,
								value: '10',
							},
						},
						circumstance: {
							[SheetAdjustmentOperationEnum['-']]: {
								type: SheetAdjustmentTypeEnum.circumstance,
								propertyType: AdjustablePropertyEnum.intProperty,
								operation: SheetAdjustmentOperationEnum['-'],
								property: AbilityEnum.strength,
								value: '5',
							},
						},
					},
				};
				const result = sheetPropertyGroupBucket.reduceBuckets();
				expect(result).toEqual([
					{
						type: SheetAdjustmentTypeEnum.status,
						propertyType: AdjustablePropertyEnum.intProperty,
						operation: SheetAdjustmentOperationEnum['+'],
						property: AbilityEnum.strength,
						value: '105',
					},
				]);
			});
			it('should return an empty array if buckets is empty', () => {
				const result = sheetPropertyGroupBucket.reduceBuckets();
				expect(result).toEqual([]);
			});

			it('should return an array of adjustments if buckets is not empty', () => {
				sheetPropertyGroupBucket.sortToBucket({
					propertyType: AdjustablePropertyEnum.none,
					type: SheetAdjustmentTypeEnum.untyped,
					property: 'name',
					operation: SheetAdjustmentOperationEnum['='],
					value: 'Alice',
				});
				sheetPropertyGroupBucket.sortToBucket({
					propertyType: AdjustablePropertyEnum.none,
					type: SheetAdjustmentTypeEnum.untyped,
					property: 'name',
					operation: SheetAdjustmentOperationEnum['+'],
					value: 'Bob',
				});
				sheetPropertyGroupBucket.sortToBucket({
					propertyType: AdjustablePropertyEnum.none,
					type: SheetAdjustmentTypeEnum.untyped,
					property: 'age',
					operation: SheetAdjustmentOperationEnum['='],
					value: '30',
				});
				const result = sheetPropertyGroupBucket.reduceBuckets();
				expect(result).toEqual([
					{
						propertyType: AdjustablePropertyEnum.none,
						type: SheetAdjustmentTypeEnum.untyped,
						property: 'name',
						operation: SheetAdjustmentOperationEnum['='],
						value: 'AliceBob',
					},
					{
						propertyType: AdjustablePropertyEnum.none,
						type: SheetAdjustmentTypeEnum.untyped,
						property: 'age',
						operation: SheetAdjustmentOperationEnum['='],
						value: '30',
					},
				]);
			});

			it('Should discard bucket results that return true from discardAdjustment', () => {
				sheetPropertyGroupBucket.sortToBucket({
					propertyType: AdjustablePropertyEnum.none,
					type: SheetAdjustmentTypeEnum.untyped,
					property: 'name',
					operation: SheetAdjustmentOperationEnum['='],
					value: 'dis',
				});
				sheetPropertyGroupBucket.sortToBucket({
					propertyType: AdjustablePropertyEnum.none,
					type: SheetAdjustmentTypeEnum.untyped,
					property: 'name',
					operation: SheetAdjustmentOperationEnum['+'],
					value: 'card',
				});
				sheetPropertyGroupBucket.sortToBucket({
					propertyType: AdjustablePropertyEnum.none,
					type: SheetAdjustmentTypeEnum.untyped,
					property: 'age',
					operation: SheetAdjustmentOperationEnum['='],
					value: '30',
				});
				const result = sheetPropertyGroupBucket.reduceBuckets();
				expect(result).toEqual([
					{
						propertyType: AdjustablePropertyEnum.none,
						type: SheetAdjustmentTypeEnum.untyped,
						property: 'age',
						operation: SheetAdjustmentOperationEnum['='],
						value: '30',
					},
				]);
			});
		});
	});
});

describe('SheetInfoBucket', () => {
	describe('combine', () => {
		it('should return the new adjustment', () => {
			const bucket = new SheetInfoBucket();
			const currentAdjustment: SheetInfoAdjustment = {
				propertyType: AdjustablePropertyEnum.info,
				type: SheetAdjustmentTypeEnum.untyped,
				property: 'name',
				operation: SheetAdjustmentOperationEnum['='],
				parsed: 'Alice',
			};
			const newAdjustment: SheetInfoAdjustment = {
				propertyType: AdjustablePropertyEnum.info,
				type: SheetAdjustmentTypeEnum.untyped,
				property: 'name',
				operation: SheetAdjustmentOperationEnum['+'],
				parsed: 'Bob',
			};
			const result = bucket.combine(currentAdjustment, newAdjustment);
			expect(result).toEqual(newAdjustment);
		});
	});

	describe('discardAdjustment', () => {
		it('should return true if the operation is "+"', () => {
			const bucket = new SheetInfoBucket();
			const adjustment: SheetAdjustment = {
				propertyType: AdjustablePropertyEnum.info,
				type: SheetAdjustmentTypeEnum.untyped,
				property: 'name',
				operation: SheetAdjustmentOperationEnum['+'],
				value: 'Alice',
			};
			const result = bucket.discardAdjustment(adjustment);
			expect(result).toBe(true);
		});

		it('should return true if the operation is "-"', () => {
			const bucket = new SheetInfoBucket();
			const adjustment: SheetAdjustment = {
				propertyType: AdjustablePropertyEnum.info,
				type: SheetAdjustmentTypeEnum.untyped,
				property: 'name',
				operation: SheetAdjustmentOperationEnum['-'],
				value: 'Bob',
			};
			const result = bucket.discardAdjustment(adjustment);
			expect(result).toBe(true);
		});

		it('should return false if the operation is =', () => {
			const bucket = new SheetInfoBucket();
			const adjustment: SheetAdjustment = {
				propertyType: AdjustablePropertyEnum.info,
				type: SheetAdjustmentTypeEnum.untyped,
				property: 'name',
				operation: SheetAdjustmentOperationEnum['='],
				value: 'Alice',
			};
			const result = bucket.discardAdjustment(adjustment);
			expect(result).toBe(false);
		});
	});
});

describe('SheetInfoListsBucket', () => {
	describe('combine', () => {
		it('should return new adjustment if operation is "="', () => {
			const bucket = new SheetInfoListsBucket();
			const currentAdjustment: SheetInfoListAdjustment = {
				propertyType: AdjustablePropertyEnum.infoList,
				type: SheetAdjustmentTypeEnum.untyped,
				property: 'name',
				operation: SheetAdjustmentOperationEnum['='],
				parsed: ['Alice'],
			};
			const newAdjustment: SheetInfoListAdjustment = {
				propertyType: AdjustablePropertyEnum.infoList,
				type: SheetAdjustmentTypeEnum.untyped,
				property: 'name',
				operation: SheetAdjustmentOperationEnum['='],
				parsed: ['Bob'],
			};
			const result = bucket.combine(currentAdjustment, newAdjustment);
			expect(result).toEqual(newAdjustment);
		});
		it('should remove values from the new adjustment if operation is "-"', () => {
			const bucket = new SheetInfoListsBucket();
			const currentAdjustment: SheetInfoListAdjustment = {
				propertyType: AdjustablePropertyEnum.infoList,
				type: SheetAdjustmentTypeEnum.untyped,
				property: 'name',
				operation: SheetAdjustmentOperationEnum['='],
				parsed: ['Alice', 'Bob', 'Charlie'],
			};
			const newAdjustment: SheetInfoListAdjustment = {
				propertyType: AdjustablePropertyEnum.infoList,
				type: SheetAdjustmentTypeEnum.untyped,
				property: 'name',
				operation: SheetAdjustmentOperationEnum['-'],
				parsed: ['Alice', 'Charlie'],
			};
			const result = bucket.combine(currentAdjustment, newAdjustment);
			expect(result).toEqual({
				propertyType: AdjustablePropertyEnum.infoList,
				type: SheetAdjustmentTypeEnum.untyped,
				property: 'name',
				operation: SheetAdjustmentOperationEnum['='],
				parsed: ['Bob'],
			});
		});

		it('should combine values if operation is "+"', () => {
			const bucket = new SheetInfoListsBucket();
			const currentAdjustment: SheetInfoListAdjustment = {
				propertyType: AdjustablePropertyEnum.info,
				type: SheetAdjustmentTypeEnum.untyped,
				property: 'name',
				operation: SheetAdjustmentOperationEnum['='],
				parsed: ['Alice'],
			};
			const newAdjustment: SheetInfoListAdjustment = {
				propertyType: AdjustablePropertyEnum.info,
				type: SheetAdjustmentTypeEnum.untyped,
				property: 'name',
				operation: SheetAdjustmentOperationEnum['+'],
				parsed: ['Bob'],
			};
			const result = bucket.combine(currentAdjustment, newAdjustment);
			expect(result).toEqual({
				propertyType: AdjustablePropertyEnum.info,
				type: SheetAdjustmentTypeEnum.untyped,
				property: 'name',
				operation: SheetAdjustmentOperationEnum['='],
				parsed: ['Alice', 'Bob'],
			});
		});
	});

	describe('discardAdjustment', () => {
		it('should return true if value is empty and operation is "+"', () => {
			const bucket = new SheetInfoListsBucket();
			const adjustment: SheetAdjustment = {
				type: SheetAdjustmentTypeEnum.untyped,
				propertyType: AdjustablePropertyEnum.info,
				property: 'name',
				operation: SheetAdjustmentOperationEnum['+'],
				value: '',
			};
			const result = bucket.discardAdjustment(adjustment);
			expect(result).toBe(true);
		});

		it('should return true if value is empty and operation is "-"', () => {
			const bucket = new SheetInfoListsBucket();
			const adjustment: SheetAdjustment = {
				type: SheetAdjustmentTypeEnum.untyped,
				propertyType: AdjustablePropertyEnum.info,
				property: 'name',
				operation: SheetAdjustmentOperationEnum['-'],
				value: '',
			};
			const result = bucket.discardAdjustment(adjustment);
			expect(result).toBe(true);
		});

		it('should return false if value is not empty', () => {
			const bucket = new SheetInfoListsBucket();
			const adjustment: SheetAdjustment = {
				type: SheetAdjustmentTypeEnum.untyped,
				propertyType: AdjustablePropertyEnum.info,
				property: 'name',
				operation: SheetAdjustmentOperationEnum['+'],
				value: 'Alice',
			};
			const result = bucket.discardAdjustment(adjustment);
			expect(result).toBe(false);
		});

		it('should return false if operation is not "+" or "-"', () => {
			const bucket = new SheetInfoListsBucket();
			const adjustment: SheetAdjustment = {
				type: SheetAdjustmentTypeEnum.untyped,
				propertyType: AdjustablePropertyEnum.info,
				property: 'name',
				operation: SheetAdjustmentOperationEnum['='],
				value: 'Alice',
			};
			const result = bucket.discardAdjustment(adjustment);
			expect(result).toBe(false);
		});
	});
});

describe('SheetIntegerPropertyBucket', () => {
	describe('combineAdjustments', () => {
		it('should combine numeric values using addition', () => {
			const bucket = new SheetIntegerPropertyBucket();
			const currentAdjustment: SheetIntegerAdjustment = {
				type: SheetAdjustmentTypeEnum.untyped,
				propertyType: AdjustablePropertyEnum.intProperty,
				property: 'age',
				operation: SheetAdjustmentOperationEnum['='],
				parsed: 30,
			};
			const newAdjustment: SheetIntegerAdjustment = {
				type: SheetAdjustmentTypeEnum.untyped,
				propertyType: AdjustablePropertyEnum.intProperty,
				property: 'age',
				operation: SheetAdjustmentOperationEnum['+'],
				parsed: 10,
			};
			const result = bucket.combine(currentAdjustment, newAdjustment);
			expect(result).toEqual({
				type: SheetAdjustmentTypeEnum.untyped,
				propertyType: AdjustablePropertyEnum.intProperty,
				property: 'age',
				operation: SheetAdjustmentOperationEnum['='],
				parsed: 40,
			});
		});
	});

	describe('combineSameType', () => {
		let sheetIntegerPropertyBucket: SheetIntegerPropertyBucket;

		beforeEach(() => {
			sheetIntegerPropertyBucket = new SheetIntegerPropertyBucket();
		});

		it('should combine two "add" adjustments', () => {
			const currentAdjustment: SheetIntegerAdjustment = {
				type: SheetAdjustmentTypeEnum.status,
				propertyType: AdjustablePropertyEnum.intProperty,
				operation: SheetAdjustmentOperationEnum['+'],
				property: AbilityEnum.strength,
				parsed: 10,
			};
			const newAdjustment: SheetIntegerAdjustment = {
				type: SheetAdjustmentTypeEnum.status,
				propertyType: AdjustablePropertyEnum.intProperty,
				operation: SheetAdjustmentOperationEnum['+'],
				property: AbilityEnum.strength,
				parsed: 5,
			};
			const result = sheetIntegerPropertyBucket.combineSameType(
				currentAdjustment,
				newAdjustment
			);
			expect(result).toEqual({
				type: SheetAdjustmentTypeEnum.status,
				propertyType: AdjustablePropertyEnum.intProperty,
				operation: SheetAdjustmentOperationEnum['+'],
				property: AbilityEnum.strength,
				parsed: 10,
			});
		});

		it('should combine two "subtract" adjustments', () => {
			const currentAdjustment: SheetIntegerAdjustment = {
				type: SheetAdjustmentTypeEnum.status,
				propertyType: AdjustablePropertyEnum.intProperty,
				operation: SheetAdjustmentOperationEnum['-'],
				property: AbilityEnum.strength,
				parsed: 10,
			};
			const newAdjustment: SheetIntegerAdjustment = {
				type: SheetAdjustmentTypeEnum.status,
				propertyType: AdjustablePropertyEnum.intProperty,
				operation: SheetAdjustmentOperationEnum['-'],
				property: AbilityEnum.strength,
				parsed: 5,
			};
			const result = sheetIntegerPropertyBucket.combineSameType(
				currentAdjustment,
				newAdjustment
			);
			expect(result).toEqual({
				type: SheetAdjustmentTypeEnum.status,
				propertyType: AdjustablePropertyEnum.intProperty,
				operation: SheetAdjustmentOperationEnum['-'],
				property: AbilityEnum.strength,
				parsed: 10,
			});
		});
	});

	describe('discardAdjustment', () => {
		it('should return true if value is empty and operation is "+" or "-"', () => {
			const bucket = new SheetIntegerPropertyBucket();
			const adjustment: SheetAdjustment = {
				type: SheetAdjustmentTypeEnum.untyped,
				propertyType: AdjustablePropertyEnum.intProperty,
				property: 'age',
				operation: SheetAdjustmentOperationEnum['+'],
				value: '',
			};
			const result = bucket.discardAdjustment(adjustment);
			expect(result).toBe(true);
		});

		it('should return false if value is not a valid integer', () => {
			const bucket = new SheetIntegerPropertyBucket();
			const adjustment: SheetAdjustment = {
				type: SheetAdjustmentTypeEnum.untyped,
				propertyType: AdjustablePropertyEnum.intProperty,
				property: 'age',
				operation: SheetAdjustmentOperationEnum['='],
				value: 'not a number',
			};
			const result = bucket.discardAdjustment(adjustment);
			expect(result).toBe(false);
		});

		it('should return false if operation is not "+" or "-"', () => {
			const bucket = new SheetIntegerPropertyBucket();
			const adjustment: SheetAdjustment = {
				type: SheetAdjustmentTypeEnum.untyped,
				propertyType: AdjustablePropertyEnum.intProperty,
				property: 'age',
				operation: SheetAdjustmentOperationEnum['='],
				value: '30',
			};
			const result = bucket.discardAdjustment(adjustment);
			expect(result).toBe(false);
		});
	});
});

describe('StatBucket', () => {
	let bucket: StatBucket;

	beforeEach(() => {
		bucket = new StatBucket();
	});

	describe('serialize', () => {
		it('should serialize a stat bonus adjustment', () => {
			const adjustment: SheetStatAdjustment = {
				type: SheetAdjustmentTypeEnum.untyped,
				operation: SheetAdjustmentOperationEnum['='],
				property: 'arcanaBonus',
				propertyType: AdjustablePropertyEnum.stat,
				parsed: {
					value: 10,
					baseKey: SheetStatKeys.arcana,
					subKey: StatSubGroupEnum.bonus,
				},
			};
			const result = bucket.serialize(adjustment);
			expect(result).toEqual({
				type: SheetAdjustmentTypeEnum.untyped,
				propertyType: AdjustablePropertyEnum.stat,
				operation: SheetAdjustmentOperationEnum['='],
				property: 'arcanaBonus',
				value: '10',
			});
		});

		it('should serialize a stat adjustment with a dc', () => {
			const adjustment: SheetStatAdjustment = {
				type: SheetAdjustmentTypeEnum.untyped,
				operation: SheetAdjustmentOperationEnum['='],
				property: 'arcanaDc',
				propertyType: AdjustablePropertyEnum.stat,
				parsed: {
					baseKey: SheetStatKeys.arcana,
					subKey: StatSubGroupEnum.dc,
					value: 15,
				},
			};
			const result = bucket.serialize(adjustment);
			expect(result).toEqual({
				type: SheetAdjustmentTypeEnum.untyped,
				propertyType: AdjustablePropertyEnum.stat,
				operation: SheetAdjustmentOperationEnum['='],
				property: 'arcanaDc',
				value: '15',
			});
		});

		it('should serialize a stat adjustment with ability', () => {
			const adjustment: SheetStatAdjustment = {
				type: SheetAdjustmentTypeEnum.untyped,
				property: 'arcanaAbility',
				operation: SheetAdjustmentOperationEnum['='],
				propertyType: AdjustablePropertyEnum.stat,
				parsed: {
					value: AbilityEnum.intelligence,
					baseKey: SheetStatKeys.arcana,
					subKey: StatSubGroupEnum.ability,
				},
			};
			const result = bucket.serialize(adjustment);
			expect(result).toEqual({
				type: SheetAdjustmentTypeEnum.untyped,
				propertyType: AdjustablePropertyEnum.stat,
				operation: SheetAdjustmentOperationEnum['='],
				property: 'arcanaAbility',
				value: AbilityEnum.intelligence,
			});
		});
	});

	describe('deserialize', () => {
		it('should deserialize a stat adjustment with bonus', () => {
			const adjustment: SheetAdjustment = {
				type: SheetAdjustmentTypeEnum.untyped,
				operation: SheetAdjustmentOperationEnum['='],
				propertyType: AdjustablePropertyEnum.stat,
				property: 'arcanaAbility',
				value: AbilityEnum.intelligence,
			};
			const result = bucket.deserialize(adjustment);
			expect(result).toEqual({
				type: SheetAdjustmentTypeEnum.untyped,
				property: 'arcanaAbility',
				operation: SheetAdjustmentOperationEnum['='],
				propertyType: AdjustablePropertyEnum.stat,
				parsed: {
					value: AbilityEnum.intelligence,
					baseKey: SheetStatKeys.arcana,
					subKey: StatSubGroupEnum.ability,
				},
			});
		});

		it('should deserialize a stat adjustment with proficiency', () => {
			const adjustment: SheetAdjustment = {
				type: SheetAdjustmentTypeEnum.untyped,
				operation: SheetAdjustmentOperationEnum['='],
				propertyType: AdjustablePropertyEnum.stat,
				property: 'arcanaProficiency',
				value: '2',
			};
			const result = bucket.deserialize(adjustment);
			expect(result).toEqual({
				type: SheetAdjustmentTypeEnum.untyped,
				propertyType: AdjustablePropertyEnum.stat,
				property: 'arcanaProficiency',
				operation: SheetAdjustmentOperationEnum['='],
				parsed: {
					value: 2,
					baseKey: SheetStatKeys.arcana,
					subKey: StatSubGroupEnum.proficiency,
				},
			});
		});

		it('should deserialize a stat adjustment with dc', () => {
			const adjustment: SheetAdjustment = {
				type: SheetAdjustmentTypeEnum.untyped,
				operation: SheetAdjustmentOperationEnum['='],
				propertyType: AdjustablePropertyEnum.stat,
				property: 'arcanaDc',
				value: '15',
			};
			const result = bucket.deserialize(adjustment);
			expect(result).toEqual({
				type: SheetAdjustmentTypeEnum.untyped,
				property: 'arcanaDc',
				propertyType: AdjustablePropertyEnum.stat,
				operation: SheetAdjustmentOperationEnum['='],
				parsed: {
					value: 15,
					baseKey: SheetStatKeys.arcana,
					subKey: StatSubGroupEnum.dc,
				},
			});
		});

		it('should deserialize a stat adjustment with ability', () => {
			const adjustment: SheetAdjustment = {
				type: SheetAdjustmentTypeEnum.untyped,
				operation: SheetAdjustmentOperationEnum['='],
				propertyType: AdjustablePropertyEnum.stat,
				property: 'arcanaAbility',
				value: AbilityEnum.strength,
			};
			const result = bucket.deserialize(adjustment);
			expect(result).toEqual({
				type: SheetAdjustmentTypeEnum.untyped,
				property: 'arcanaAbility',
				propertyType: AdjustablePropertyEnum.stat,
				operation: SheetAdjustmentOperationEnum['='],
				parsed: {
					value: AbilityEnum.strength,
					baseKey: SheetStatKeys.arcana,
					subKey: StatSubGroupEnum.ability,
				},
			});
		});
	});

	describe('combine', () => {
		it('should combine two numeric stat adjustments with = operation by overwriting', () => {
			const currentAdjustment: SheetStatAdjustment = {
				type: SheetAdjustmentTypeEnum.untyped,
				operation: SheetAdjustmentOperationEnum['+'],
				property: 'arcanaBonus',
				propertyType: AdjustablePropertyEnum.stat,
				parsed: {
					value: 10,
					baseKey: SheetStatKeys.arcana,
					subKey: StatSubGroupEnum.bonus,
				},
			};
			const newAdjustment: SheetStatAdjustment = {
				type: SheetAdjustmentTypeEnum.untyped,
				operation: SheetAdjustmentOperationEnum['='],
				property: 'arcanaBonus',
				propertyType: AdjustablePropertyEnum.stat,
				parsed: {
					value: 15,
					baseKey: SheetStatKeys.arcana,
					subKey: StatSubGroupEnum.bonus,
				},
			};
			const result = bucket.combine(currentAdjustment, newAdjustment);
			expect(result).toEqual({
				type: SheetAdjustmentTypeEnum.untyped,
				operation: SheetAdjustmentOperationEnum['='],
				property: 'arcanaBonus',
				propertyType: AdjustablePropertyEnum.stat,
				parsed: {
					value: 15,
					baseKey: SheetStatKeys.arcana,
					subKey: StatSubGroupEnum.bonus,
				},
			});
		});

		it('should combine two numeric stat adjustments with =, then + operation', () => {
			const currentAdjustment: SheetStatAdjustment = {
				type: SheetAdjustmentTypeEnum.untyped,
				operation: SheetAdjustmentOperationEnum['='],
				property: 'arcanaProficiency',
				propertyType: AdjustablePropertyEnum.stat,
				parsed: {
					value: 4,
					baseKey: SheetStatKeys.arcana,
					subKey: StatSubGroupEnum.proficiency,
				},
			};
			const newAdjustment: SheetStatAdjustment = {
				type: SheetAdjustmentTypeEnum.untyped,
				operation: SheetAdjustmentOperationEnum['+'],
				property: 'arcanaProficiency',
				propertyType: AdjustablePropertyEnum.stat,
				parsed: {
					value: 2,
					baseKey: SheetStatKeys.arcana,
					subKey: StatSubGroupEnum.proficiency,
				},
			};
			const result = bucket.combine(currentAdjustment, newAdjustment);
			expect(result).toEqual({
				type: SheetAdjustmentTypeEnum.untyped,
				operation: SheetAdjustmentOperationEnum['='],
				property: 'arcanaProficiency',
				propertyType: AdjustablePropertyEnum.stat,
				parsed: {
					value: 6,
					baseKey: SheetStatKeys.arcana,
					subKey: StatSubGroupEnum.proficiency,
				},
			});
		});

		it('should combine two numeric stat adjustments with - operation', () => {
			const currentAdjustment: SheetStatAdjustment = {
				type: SheetAdjustmentTypeEnum.untyped,
				operation: SheetAdjustmentOperationEnum['='],
				property: 'ArcanaBonus',
				propertyType: AdjustablePropertyEnum.stat,
				parsed: {
					value: 10,
					baseKey: SheetStatKeys.arcana,
					subKey: StatSubGroupEnum.bonus,
				},
			};
			const newAdjustment: SheetStatAdjustment = {
				type: SheetAdjustmentTypeEnum.untyped,
				operation: SheetAdjustmentOperationEnum['-'],
				property: 'ArcanaBonus',
				propertyType: AdjustablePropertyEnum.stat,
				parsed: {
					value: 2,
					baseKey: SheetStatKeys.arcana,
					subKey: StatSubGroupEnum.bonus,
				},
			};
			const result = bucket.combine(currentAdjustment, newAdjustment);
			expect(result).toEqual({
				type: SheetAdjustmentTypeEnum.untyped,
				operation: SheetAdjustmentOperationEnum['='],
				property: 'ArcanaBonus',
				propertyType: AdjustablePropertyEnum.stat,
				parsed: {
					value: 8,
					baseKey: SheetStatKeys.arcana,
					subKey: StatSubGroupEnum.bonus,
				},
			});
		});
		it('should combine two text stat adjustments with = operation by overwriting', () => {
			const currentAdjustment: SheetStatAdjustment = {
				type: SheetAdjustmentTypeEnum.untyped,
				operation: SheetAdjustmentOperationEnum['+'],
				property: 'arcanaAbility',
				propertyType: AdjustablePropertyEnum.stat,
				parsed: {
					value: AbilityEnum.intelligence,
					baseKey: SheetStatKeys.arcana,
					subKey: StatSubGroupEnum.ability,
				},
			};
			const newAdjustment: SheetStatAdjustment = {
				type: SheetAdjustmentTypeEnum.untyped,
				operation: SheetAdjustmentOperationEnum['='],
				property: 'arcanaAbility',
				propertyType: AdjustablePropertyEnum.stat,
				parsed: {
					value: AbilityEnum.charisma,
					baseKey: SheetStatKeys.arcana,
					subKey: StatSubGroupEnum.ability,
				},
			};
			const result = bucket.combine(currentAdjustment, newAdjustment);
			expect(result).toEqual({
				type: SheetAdjustmentTypeEnum.untyped,
				operation: SheetAdjustmentOperationEnum['='],
				property: 'arcanaAbility',
				propertyType: AdjustablePropertyEnum.stat,
				parsed: {
					value: AbilityEnum.charisma,
					baseKey: SheetStatKeys.arcana,
					subKey: StatSubGroupEnum.ability,
				},
			});
		});

		it('should combine two text stat adjustments with =, then + operation', () => {
			const currentAdjustment: SheetStatAdjustment = {
				type: SheetAdjustmentTypeEnum.untyped,
				operation: SheetAdjustmentOperationEnum['='],
				property: 'arcanaAbility',
				propertyType: AdjustablePropertyEnum.stat,
				parsed: {
					value: AbilityEnum.intelligence,
					baseKey: SheetStatKeys.arcana,
					subKey: StatSubGroupEnum.ability,
				},
			};
			const newAdjustment: SheetStatAdjustment = {
				type: SheetAdjustmentTypeEnum.untyped,
				operation: SheetAdjustmentOperationEnum['+'],
				property: 'arcanaAbility',
				propertyType: AdjustablePropertyEnum.stat,
				parsed: {
					value: AbilityEnum.strength,
					baseKey: SheetStatKeys.arcana,
					subKey: StatSubGroupEnum.ability,
				},
			};
			const result = bucket.combine(currentAdjustment, newAdjustment);
			expect(result).toEqual({
				type: SheetAdjustmentTypeEnum.untyped,
				operation: SheetAdjustmentOperationEnum['+'],
				property: 'arcanaAbility',
				propertyType: AdjustablePropertyEnum.stat,
				parsed: {
					value: AbilityEnum.strength,
					baseKey: SheetStatKeys.arcana,
					subKey: StatSubGroupEnum.ability,
				},
			});
		});

		it('should combine two text stat adjustments with - operation', () => {
			const currentAdjustment: SheetStatAdjustment = {
				type: SheetAdjustmentTypeEnum.untyped,
				operation: SheetAdjustmentOperationEnum['='],
				property: 'ArcanaAbility',
				propertyType: AdjustablePropertyEnum.stat,
				parsed: {
					value: AbilityEnum.intelligence,
					baseKey: SheetStatKeys.arcana,
					subKey: StatSubGroupEnum.ability,
				},
			};
			const newAdjustment: SheetStatAdjustment = {
				type: SheetAdjustmentTypeEnum.untyped,
				operation: SheetAdjustmentOperationEnum['-'],
				property: 'ArcanaAbility',
				propertyType: AdjustablePropertyEnum.stat,
				parsed: {
					value: AbilityEnum.intelligence,
					baseKey: SheetStatKeys.arcana,
					subKey: StatSubGroupEnum.ability,
				},
			};
			const result = bucket.combine(currentAdjustment, newAdjustment);
			expect(result).toEqual({
				type: SheetAdjustmentTypeEnum.untyped,
				operation: SheetAdjustmentOperationEnum['='],
				property: 'ArcanaAbility',
				propertyType: AdjustablePropertyEnum.stat,
				parsed: {
					value: '',
					baseKey: SheetStatKeys.arcana,
					subKey: StatSubGroupEnum.ability,
				},
			});
		});
	});

	describe('discardAdjustment', () => {
		it('should discard a stat adjustment with empty value and + operation', () => {
			const adjustment: SheetAdjustment = {
				type: SheetAdjustmentTypeEnum.untyped,
				operation: SheetAdjustmentOperationEnum['+'],
				propertyType: AdjustablePropertyEnum.stat,
				property: 'test',
				value: '',
			};
			const result = bucket.discardAdjustment(adjustment);
			expect(result).toBe(true);
		});

		it('should discard a stat adjustment with empty value and - operation', () => {
			const adjustment: SheetAdjustment = {
				type: SheetAdjustmentTypeEnum.untyped,
				operation: SheetAdjustmentOperationEnum['-'],
				propertyType: AdjustablePropertyEnum.stat,
				property: 'test',
				value: '',
			};
			const result = bucket.discardAdjustment(adjustment);
			expect(result).toBe(true);
		});

		it('should not discard a stat adjustment with non-empty value and + operation', () => {
			const adjustment: SheetAdjustment = {
				type: SheetAdjustmentTypeEnum.untyped,
				operation: SheetAdjustmentOperationEnum['+'],
				propertyType: AdjustablePropertyEnum.stat,
				property: 'test',
				value: 'bonus:10',
			};
			const result = bucket.discardAdjustment(adjustment);
			expect(result).toBe(false);
		});

		it('should not discard a stat adjustment with non-empty value and - operation', () => {
			const adjustment: SheetAdjustment = {
				type: SheetAdjustmentTypeEnum.untyped,
				operation: SheetAdjustmentOperationEnum['-'],
				propertyType: AdjustablePropertyEnum.stat,
				property: 'test',
				value: 'bonus:10',
			};
			const result = bucket.discardAdjustment(adjustment);
			expect(result).toBe(false);
		});
	});
});

describe('ExtraSkillBucket', () => {
	let bucket: ExtraSkillBucket;

	beforeEach(() => {
		bucket = new ExtraSkillBucket();
	});

	describe('serialize', () => {
		it('should serialize an extra skill bonus adjustment', () => {
			const adjustment: SheetExtraSkillAdjustment = {
				type: SheetAdjustmentTypeEnum.untyped,
				operation: SheetAdjustmentOperationEnum['='],
				property: 'kobold lore bonus',
				propertyType: AdjustablePropertyEnum.extraSkill,
				parsed: {
					value: 10,
					baseKey: 'Kobold Lore',
					subKey: StatSubGroupEnum.bonus,
				},
			};
			const result = bucket.serialize(adjustment);
			expect(result).toEqual({
				type: SheetAdjustmentTypeEnum.untyped,
				propertyType: AdjustablePropertyEnum.extraSkill,
				operation: SheetAdjustmentOperationEnum['='],
				property: 'kobold lore bonus',
				value: '10',
			});
		});

		it('should serialize an extra skill adjustment a dc', () => {
			const adjustment: SheetExtraSkillAdjustment = {
				type: SheetAdjustmentTypeEnum.untyped,
				operation: SheetAdjustmentOperationEnum['='],
				property: 'kobold lore dc',
				propertyType: AdjustablePropertyEnum.extraSkill,
				parsed: {
					baseKey: 'kobold lore',
					subKey: StatSubGroupEnum.dc,
					value: 15,
				},
			};
			const result = bucket.serialize(adjustment);
			expect(result).toEqual({
				type: SheetAdjustmentTypeEnum.untyped,
				propertyType: AdjustablePropertyEnum.extraSkill,
				operation: SheetAdjustmentOperationEnum['='],
				property: 'kobold lore dc',
				value: '15',
			});
		});

		it('should serialize an extra skill adjustment a proficiency', () => {
			const adjustment: SheetExtraSkillAdjustment = {
				type: SheetAdjustmentTypeEnum.untyped,
				operation: SheetAdjustmentOperationEnum['='],
				property: 'kobold lore proficiency',
				propertyType: AdjustablePropertyEnum.extraSkill,
				parsed: {
					baseKey: 'kobold lore',
					subKey: StatSubGroupEnum.proficiency,
					value: 15,
				},
			};
			const result = bucket.serialize(adjustment);
			expect(result).toEqual({
				type: SheetAdjustmentTypeEnum.untyped,
				propertyType: AdjustablePropertyEnum.extraSkill,
				operation: SheetAdjustmentOperationEnum['='],
				property: 'kobold lore proficiency',
				value: '15',
			});
		});

		it('should serialize an extra skill adjustment with an ability', () => {
			const adjustment: SheetExtraSkillAdjustment = {
				type: SheetAdjustmentTypeEnum.untyped,
				property: 'kobold lore ability',
				operation: SheetAdjustmentOperationEnum['='],
				propertyType: AdjustablePropertyEnum.extraSkill,
				parsed: {
					value: AbilityEnum.intelligence,
					baseKey: SheetStatKeys.arcana,
					subKey: StatSubGroupEnum.ability,
				},
			};
			const result = bucket.serialize(adjustment);
			expect(result).toEqual({
				type: SheetAdjustmentTypeEnum.untyped,
				propertyType: AdjustablePropertyEnum.extraSkill,
				operation: SheetAdjustmentOperationEnum['='],
				property: 'kobold lore ability',
				value: AbilityEnum.intelligence,
			});
		});
	});

	describe('deserialize', () => {
		it('should deserialize adjustment with a bonus by default', () => {
			const adjustment: SheetAdjustment = {
				type: SheetAdjustmentTypeEnum.untyped,
				operation: SheetAdjustmentOperationEnum['='],
				propertyType: AdjustablePropertyEnum.extraSkill,
				property: 'kobold lore',
				value: '8',
			};
			const result = bucket.deserialize(adjustment);
			expect(result).toEqual({
				type: SheetAdjustmentTypeEnum.untyped,
				property: 'kobold lore',
				operation: SheetAdjustmentOperationEnum['='],
				propertyType: AdjustablePropertyEnum.extraSkill,
				parsed: {
					value: 8,
					baseKey: 'kobold lore',
					subKey: StatSubGroupEnum.bonus,
				},
			});
		});

		it('should deserialize adjustment with proficiency', () => {
			const adjustment: SheetAdjustment = {
				type: SheetAdjustmentTypeEnum.untyped,
				operation: SheetAdjustmentOperationEnum['='],
				propertyType: AdjustablePropertyEnum.extraSkill,
				property: 'koboldLoreProf',
				value: '2',
			};
			const result = bucket.deserialize(adjustment);
			expect(result).toEqual({
				type: SheetAdjustmentTypeEnum.untyped,
				propertyType: AdjustablePropertyEnum.extraSkill,
				property: 'koboldLoreProf',
				operation: SheetAdjustmentOperationEnum['='],
				parsed: {
					value: 2,
					baseKey: 'kobold lore',
					subKey: StatSubGroupEnum.proficiency,
				},
			});
		});

		it('should deserialize adjustment with dc', () => {
			const adjustment: SheetAdjustment = {
				type: SheetAdjustmentTypeEnum.untyped,
				operation: SheetAdjustmentOperationEnum['='],
				propertyType: AdjustablePropertyEnum.extraSkill,
				property: 'kobold-lore-dc',
				value: '15',
			};
			const result = bucket.deserialize(adjustment);
			expect(result).toEqual({
				type: SheetAdjustmentTypeEnum.untyped,
				property: 'kobold-lore-dc',
				propertyType: AdjustablePropertyEnum.extraSkill,
				operation: SheetAdjustmentOperationEnum['='],
				parsed: {
					value: 15,
					baseKey: 'kobold lore',
					subKey: StatSubGroupEnum.dc,
				},
			});
		});

		it('should deserialize adjustment with ability', () => {
			const adjustment: SheetAdjustment = {
				type: SheetAdjustmentTypeEnum.untyped,
				operation: SheetAdjustmentOperationEnum['='],
				propertyType: AdjustablePropertyEnum.extraSkill,
				property: 'esoteric lore ability',
				value: AbilityEnum.charisma,
			};
			const result = bucket.deserialize(adjustment);
			expect(result).toEqual({
				type: SheetAdjustmentTypeEnum.untyped,
				property: 'esoteric lore ability',
				propertyType: AdjustablePropertyEnum.extraSkill,
				operation: SheetAdjustmentOperationEnum['='],
				parsed: {
					value: AbilityEnum.charisma,
					baseKey: 'esoteric lore',
					subKey: StatSubGroupEnum.ability,
				},
			});
		});
	});

	describe('combine', () => {
		it('should combine two numeric extraSkill adjustments with = operation by overwriting', () => {
			const currentAdjustment: SheetExtraSkillAdjustment = {
				type: SheetAdjustmentTypeEnum.untyped,
				operation: SheetAdjustmentOperationEnum['+'],
				property: 'arcanaBonus',
				propertyType: AdjustablePropertyEnum.extraSkill,
				parsed: {
					value: 10,
					baseKey: SheetStatKeys.arcana,
					subKey: StatSubGroupEnum.bonus,
				},
			};
			const newAdjustment: SheetExtraSkillAdjustment = {
				type: SheetAdjustmentTypeEnum.untyped,
				operation: SheetAdjustmentOperationEnum['='],
				property: 'arcanaBonus',
				propertyType: AdjustablePropertyEnum.extraSkill,
				parsed: {
					value: 15,
					baseKey: SheetStatKeys.arcana,
					subKey: StatSubGroupEnum.bonus,
				},
			};
			const result = bucket.combine(currentAdjustment, newAdjustment);
			expect(result).toEqual({
				type: SheetAdjustmentTypeEnum.untyped,
				operation: SheetAdjustmentOperationEnum['='],
				property: 'arcanaBonus',
				propertyType: AdjustablePropertyEnum.extraSkill,
				parsed: {
					value: 15,
					baseKey: SheetStatKeys.arcana,
					subKey: StatSubGroupEnum.bonus,
				},
			});
		});

		it('should combine two numeric extraSkill adjustments with =, then + operation', () => {
			const currentAdjustment: SheetExtraSkillAdjustment = {
				type: SheetAdjustmentTypeEnum.untyped,
				operation: SheetAdjustmentOperationEnum['='],
				property: 'arcanaProficiency',
				propertyType: AdjustablePropertyEnum.extraSkill,
				parsed: {
					value: 4,
					baseKey: SheetStatKeys.arcana,
					subKey: StatSubGroupEnum.proficiency,
				},
			};
			const newAdjustment: SheetExtraSkillAdjustment = {
				type: SheetAdjustmentTypeEnum.untyped,
				operation: SheetAdjustmentOperationEnum['+'],
				property: 'arcanaProficiency',
				propertyType: AdjustablePropertyEnum.extraSkill,
				parsed: {
					value: 2,
					baseKey: SheetStatKeys.arcana,
					subKey: StatSubGroupEnum.proficiency,
				},
			};
			const result = bucket.combine(currentAdjustment, newAdjustment);
			expect(result).toEqual({
				type: SheetAdjustmentTypeEnum.untyped,
				operation: SheetAdjustmentOperationEnum['='],
				property: 'arcanaProficiency',
				propertyType: AdjustablePropertyEnum.extraSkill,
				parsed: {
					value: 6,
					baseKey: SheetStatKeys.arcana,
					subKey: StatSubGroupEnum.proficiency,
				},
			});
		});

		it('should combine two numeric extraSkill adjustments with - operation', () => {
			const currentAdjustment: SheetExtraSkillAdjustment = {
				type: SheetAdjustmentTypeEnum.untyped,
				operation: SheetAdjustmentOperationEnum['='],
				property: 'ArcanaBonus',
				propertyType: AdjustablePropertyEnum.extraSkill,
				parsed: {
					value: 10,
					baseKey: SheetStatKeys.arcana,
					subKey: StatSubGroupEnum.bonus,
				},
			};
			const newAdjustment: SheetExtraSkillAdjustment = {
				type: SheetAdjustmentTypeEnum.untyped,
				operation: SheetAdjustmentOperationEnum['-'],
				property: 'ArcanaBonus',
				propertyType: AdjustablePropertyEnum.extraSkill,
				parsed: {
					value: 2,
					baseKey: SheetStatKeys.arcana,
					subKey: StatSubGroupEnum.bonus,
				},
			};
			const result = bucket.combine(currentAdjustment, newAdjustment);
			expect(result).toEqual({
				type: SheetAdjustmentTypeEnum.untyped,
				operation: SheetAdjustmentOperationEnum['='],
				property: 'ArcanaBonus',
				propertyType: AdjustablePropertyEnum.extraSkill,
				parsed: {
					value: 8,
					baseKey: SheetStatKeys.arcana,
					subKey: StatSubGroupEnum.bonus,
				},
			});
		});
		it('should combine two text extraSkill adjustments with = operation by overwriting', () => {
			const currentAdjustment: SheetExtraSkillAdjustment = {
				type: SheetAdjustmentTypeEnum.untyped,
				operation: SheetAdjustmentOperationEnum['+'],
				property: 'arcanaAbility',
				propertyType: AdjustablePropertyEnum.extraSkill,
				parsed: {
					value: AbilityEnum.intelligence,
					baseKey: SheetStatKeys.arcana,
					subKey: StatSubGroupEnum.ability,
				},
			};
			const newAdjustment: SheetExtraSkillAdjustment = {
				type: SheetAdjustmentTypeEnum.untyped,
				operation: SheetAdjustmentOperationEnum['='],
				property: 'arcanaAbility',
				propertyType: AdjustablePropertyEnum.extraSkill,
				parsed: {
					value: AbilityEnum.charisma,
					baseKey: SheetStatKeys.arcana,
					subKey: StatSubGroupEnum.ability,
				},
			};
			const result = bucket.combine(currentAdjustment, newAdjustment);
			expect(result).toEqual({
				type: SheetAdjustmentTypeEnum.untyped,
				operation: SheetAdjustmentOperationEnum['='],
				property: 'arcanaAbility',
				propertyType: AdjustablePropertyEnum.extraSkill,
				parsed: {
					value: AbilityEnum.charisma,
					baseKey: SheetStatKeys.arcana,
					subKey: StatSubGroupEnum.ability,
				},
			});
		});

		it('should combine two text extraSkill adjustments with =, then + operation', () => {
			const currentAdjustment: SheetExtraSkillAdjustment = {
				type: SheetAdjustmentTypeEnum.untyped,
				operation: SheetAdjustmentOperationEnum['='],
				property: 'arcanaAbility',
				propertyType: AdjustablePropertyEnum.extraSkill,
				parsed: {
					value: AbilityEnum.intelligence,
					baseKey: SheetStatKeys.arcana,
					subKey: StatSubGroupEnum.ability,
				},
			};
			const newAdjustment: SheetExtraSkillAdjustment = {
				type: SheetAdjustmentTypeEnum.untyped,
				operation: SheetAdjustmentOperationEnum['+'],
				property: 'arcanaAbility',
				propertyType: AdjustablePropertyEnum.extraSkill,
				parsed: {
					value: AbilityEnum.strength,
					baseKey: SheetStatKeys.arcana,
					subKey: StatSubGroupEnum.ability,
				},
			};
			const result = bucket.combine(currentAdjustment, newAdjustment);
			expect(result).toEqual({
				type: SheetAdjustmentTypeEnum.untyped,
				operation: SheetAdjustmentOperationEnum['+'],
				property: 'arcanaAbility',
				propertyType: AdjustablePropertyEnum.extraSkill,
				parsed: {
					value: AbilityEnum.strength,
					baseKey: SheetStatKeys.arcana,
					subKey: StatSubGroupEnum.ability,
				},
			});
		});

		it('should combine two text extraSkill adjustments with - operation', () => {
			const currentAdjustment: SheetExtraSkillAdjustment = {
				type: SheetAdjustmentTypeEnum.untyped,
				operation: SheetAdjustmentOperationEnum['='],
				property: 'ArcanaAbility',
				propertyType: AdjustablePropertyEnum.extraSkill,
				parsed: {
					value: AbilityEnum.intelligence,
					baseKey: SheetStatKeys.arcana,
					subKey: StatSubGroupEnum.ability,
				},
			};
			const newAdjustment: SheetExtraSkillAdjustment = {
				type: SheetAdjustmentTypeEnum.untyped,
				operation: SheetAdjustmentOperationEnum['-'],
				property: 'ArcanaAbility',
				propertyType: AdjustablePropertyEnum.extraSkill,
				parsed: {
					value: AbilityEnum.intelligence,
					baseKey: SheetStatKeys.arcana,
					subKey: StatSubGroupEnum.ability,
				},
			};
			const result = bucket.combine(currentAdjustment, newAdjustment);
			expect(result).toEqual({
				type: SheetAdjustmentTypeEnum.untyped,
				operation: SheetAdjustmentOperationEnum['='],
				property: 'ArcanaAbility',
				propertyType: AdjustablePropertyEnum.extraSkill,
				parsed: {
					value: '',
					baseKey: SheetStatKeys.arcana,
					subKey: StatSubGroupEnum.ability,
				},
			});
		});
	});

	describe('discardAdjustment', () => {
		it('should discard an extra skill adjustment with empty value and + operation', () => {
			const adjustment: SheetAdjustment = {
				type: SheetAdjustmentTypeEnum.untyped,
				operation: SheetAdjustmentOperationEnum['+'],
				propertyType: AdjustablePropertyEnum.extraSkill,
				property: 'test',
				value: '',
			};
			const result = bucket.discardAdjustment(adjustment);
			expect(result).toBe(true);
		});

		it('should discard an extra skill adjustment with empty value and - operation', () => {
			const adjustment: SheetAdjustment = {
				type: SheetAdjustmentTypeEnum.untyped,
				operation: SheetAdjustmentOperationEnum['-'],
				propertyType: AdjustablePropertyEnum.extraSkill,
				property: 'test',
				value: '',
			};
			const result = bucket.discardAdjustment(adjustment);
			expect(result).toBe(true);
		});

		it('should not discard an extra skill adjustment with non-empty value and + operation', () => {
			const adjustment: SheetAdjustment = {
				type: SheetAdjustmentTypeEnum.untyped,
				operation: SheetAdjustmentOperationEnum['+'],
				propertyType: AdjustablePropertyEnum.extraSkill,
				property: 'test',
				value: 'bonus:10',
			};
			const result = bucket.discardAdjustment(adjustment);
			expect(result).toBe(false);
		});

		it('should not discard an extra skill adjustment with non-empty value and - operation', () => {
			const adjustment: SheetAdjustment = {
				type: SheetAdjustmentTypeEnum.untyped,
				operation: SheetAdjustmentOperationEnum['-'],
				propertyType: AdjustablePropertyEnum.extraSkill,
				property: 'test',
				value: 'bonus:10',
			};
			const result = bucket.discardAdjustment(adjustment);
			expect(result).toBe(false);
		});
	});
});

describe('WeaknessResistanceBucket', () => {
	let weaknessResistanceBucket: WeaknessResistanceBucket;

	beforeEach(() => {
		weaknessResistanceBucket = new WeaknessResistanceBucket();
	});

	describe('sortToBucket', () => {
		it('should add an adjustment to the correct bucket', () => {
			const adjustment: SheetAdjustment = {
				type: SheetAdjustmentTypeEnum.status,
				propertyType: AdjustablePropertyEnum.weaknessResistance,
				operation: SheetAdjustmentOperationEnum['+'],
				property: 'fire weakness',
				value: '10',
			};
			weaknessResistanceBucket.sortToBucket(adjustment);
			expect(weaknessResistanceBucket.buckets['fire weakness']).toEqual({
				status: {
					[SheetAdjustmentOperationEnum['+']]: {
						..._.omit(adjustment, 'value'),
						parsed: 10,
					},
				},
			});
		});

		it('should discard an adjustment with an empty value and "+" operation', () => {
			const adjustment: SheetAdjustment = {
				type: SheetAdjustmentTypeEnum.status,
				propertyType: AdjustablePropertyEnum.weaknessResistance,
				operation: SheetAdjustmentOperationEnum['+'],
				property: 'fire weakness',
				value: '',
			};
			weaknessResistanceBucket.sortToBucket(adjustment);
			expect(weaknessResistanceBucket.buckets['fire weakness']).toBeUndefined();
		});

		it('should discard an adjustment with an empty value and "-" operation', () => {
			const adjustment: SheetAdjustment = {
				type: SheetAdjustmentTypeEnum.status,
				propertyType: AdjustablePropertyEnum.weaknessResistance,
				operation: SheetAdjustmentOperationEnum['-'],
				property: 'fire resistance',
				value: '',
			};
			weaknessResistanceBucket.sortToBucket(adjustment);
			expect(weaknessResistanceBucket.buckets['fire resistance']).toBeUndefined();
		});

		it('should throw an error for an adjustment with a non-numeric value', () => {
			const adjustment: SheetAdjustment = {
				type: SheetAdjustmentTypeEnum.status,
				propertyType: AdjustablePropertyEnum.weaknessResistance,
				operation: SheetAdjustmentOperationEnum['+'],
				property: 'fire resistance',
				value: 'not a number',
			};
			expect(() => weaknessResistanceBucket.sortToBucket(adjustment)).toThrow(KoboldError);
		});
	});

	describe('reduceBuckets', () => {
		it('should reduce the bucket and return the adjustments', () => {
			const adjustment1: SheetAdjustment = {
				type: SheetAdjustmentTypeEnum.status,
				propertyType: AdjustablePropertyEnum.weaknessResistance,
				operation: SheetAdjustmentOperationEnum['+'],
				property: 'cold weakness',
				value: '10',
			};
			const adjustment2: SheetAdjustment = {
				type: SheetAdjustmentTypeEnum.status,
				propertyType: AdjustablePropertyEnum.weaknessResistance,
				operation: SheetAdjustmentOperationEnum['-'],
				property: 'cold weakness',
				value: '5',
			};
			const resultAdjustment: SheetAdjustment = {
				type: SheetAdjustmentTypeEnum.status,
				propertyType: AdjustablePropertyEnum.weaknessResistance,
				operation: SheetAdjustmentOperationEnum['+'],
				property: 'cold weakness',
				value: '5',
			};
			weaknessResistanceBucket.sortToBucket(adjustment1);
			weaknessResistanceBucket.sortToBucket(adjustment2);
			const result = weaknessResistanceBucket.reduceBuckets();
			expect(result).toContainEqual(resultAdjustment);
			expect(result).not.toContainEqual(adjustment1);
			expect(result).not.toContainEqual(adjustment2);
		});
	});
});

describe('AttackBucket', () => {
	let attackBucket: AttackBucket;

	beforeEach(() => {
		attackBucket = new AttackBucket();
	});

	describe('discardAdjustment', () => {
		it('should discard an adjustment with "+" operation', () => {
			const adjustment: SheetAdjustment = {
				type: SheetAdjustmentTypeEnum.untyped,
				propertyType: AdjustablePropertyEnum.attack,
				operation: SheetAdjustmentOperationEnum['+'],
				property: 'fire',
				value: 'attack: 10; damage: 1d4+2',
			};
			const result = attackBucket.discardAdjustment(adjustment);
			expect(result).toBe(true);
		});

		it('should discard an adjustment with "-" operation', () => {
			const adjustment: SheetAdjustment = {
				type: SheetAdjustmentTypeEnum.untyped,
				propertyType: AdjustablePropertyEnum.attack,
				operation: SheetAdjustmentOperationEnum['-'],
				property: 'claw',
				value: 'attack: 10; damage: 1d4+2',
			};
			const result = attackBucket.discardAdjustment(adjustment);
			expect(result).toBe(true);
		});

		it('should not discard an adjustment with "=" operation', () => {
			const adjustment: SheetAdjustment = {
				type: SheetAdjustmentTypeEnum.untyped,
				propertyType: AdjustablePropertyEnum.attack,
				operation: SheetAdjustmentOperationEnum['='],
				property: 'claw',
				value: 'attack: 10; damage: 1d4+2',
			};
			const result = attackBucket.discardAdjustment(adjustment);
			expect(result).toBe(false);
		});
	});

	describe('serialize', () => {
		it('should serialize an adjustment to a string', () => {
			const adjustment: SheetAttackAdjustment = {
				type: SheetAdjustmentTypeEnum.untyped,
				propertyType: AdjustablePropertyEnum.attack,
				operation: SheetAdjustmentOperationEnum['='],
				property: 'claw attack',
				parsed: {
					name: 'claw',
					toHit: 5,
					damage: [{ dice: '1d4+2', type: 'slashing' }],
					effects: ['grab', 'spiny eurypterid venom'],
					range: '10 ft',
					traits: ['agile', 'finesse'],
					notes: 'This is a note',
				},
			};
			const result = attackBucket.serialize(adjustment);
			expect(result.value).toBe(
				'to hit: 5; damage: 1d4+2 slashing; range: 10 ft; traits: agile,finesse; effects: grab,spiny eurypterid venom; notes: This is a note'
			);
		});
	});

	describe('deserialize', () => {
		it('should deserialize a string to an adjustment', () => {
			const adjustment: SheetAdjustment = {
				type: SheetAdjustmentTypeEnum.untyped,
				propertyType: AdjustablePropertyEnum.attack,
				operation: SheetAdjustmentOperationEnum['='],
				property: 'claw attack',
				value: 'to hit: 5 | damage: 1d4+2 slashing | range: 10 ft & traits: agile, finesse | effects: grab, spiny eurypterid venom & notes: This is a note',
			};
			const result = attackBucket.deserialize(adjustment);
			expect(result).toEqual({
				type: SheetAdjustmentTypeEnum.untyped,
				propertyType: AdjustablePropertyEnum.attack,
				operation: SheetAdjustmentOperationEnum['='],
				property: 'claw attack',
				parsed: {
					name: 'claw',
					toHit: 5,
					damage: [{ dice: '1d4+2', type: 'slashing' }],
					effects: ['grab', 'spiny eurypterid venom'],
					range: '10 ft',
					traits: ['agile', 'finesse'],
					notes: 'This is a note',
				},
			});
		});
	});

	describe('combine', () => {
		it('should return the new adjustment', () => {
			const currentAdjustment: SheetAttackAdjustment = {
				type: SheetAdjustmentTypeEnum.untyped,
				propertyType: AdjustablePropertyEnum.attack,
				operation: SheetAdjustmentOperationEnum['='],
				property: 'claw attack',
				parsed: {
					name: 'claw',
					toHit: 5,
					damage: [{ dice: '1d4+2', type: 'slashing' }],
					effects: [],
					range: '10 ft',
					traits: ['agile', 'finesse'],
					notes: 'This is a note',
				},
			};
			const newAdjustment: SheetAttackAdjustment = {
				type: SheetAdjustmentTypeEnum.untyped,
				propertyType: AdjustablePropertyEnum.attack,
				operation: SheetAdjustmentOperationEnum['='],
				property: 'claw attack',
				parsed: {
					name: 'claw',
					toHit: 10,
					damage: [{ dice: '1d6+3', type: 'slashing' }],
					effects: [],
					range: '5 ft',
					traits: ['agile'],
					notes: 'a note',
				},
			};
			const result = attackBucket.combine(currentAdjustment, newAdjustment);
			expect(result).toEqual(newAdjustment);
		});
	});
});
