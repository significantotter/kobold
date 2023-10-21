import _ from 'lodash';
import {
	SheetAttackAdjustment,
	SheetInfoAdjustment,
	SheetInfoListAdjustment,
	SheetIntegerAdjustment,
	SheetStatAdjustment,
	TypedSheetAdjustment,
} from './sheet-adjuster.js';
import {
	SheetPropertyGroupBucket,
	SheetInfoBucket,
	SheetInfoListsBucket,
	StatBucket,
	SheetIntegerPropertyBucket,
	WeaknessResistanceBucket,
	AttackBucket,
} from './sheet-adjustment-bucketer.js';

class TestSheetPropertyGroupBucket extends SheetPropertyGroupBucket<TypedSheetAdjustment> {
	public serialize(adjustment: TypedSheetAdjustment): TypedSheetAdjustment {
		return adjustment;
	}
	public deserialize(adjustment: TypedSheetAdjustment): TypedSheetAdjustment {
		return adjustment;
	}
	public discardAdjustment(adjustment: TypedSheetAdjustment): boolean {
		return adjustment.value === 'discard';
	}

	public combine(
		currentAdjustment: TypedSheetAdjustment,
		newAdjustment: TypedSheetAdjustment
	): TypedSheetAdjustment {
		return {
			...currentAdjustment,
			value: currentAdjustment.value + newAdjustment.value,
		};
	}
	public combineSameType = this.combine.bind(this);
}

describe('SheetPropertyGroupBucket', () => {
	describe('sortToBucket', () => {
		it('should add new adjustment to bucket if bucket is empty', () => {
			const bucket = new TestSheetPropertyGroupBucket();
			const adjustment: TypedSheetAdjustment = {
				propertyType: 'info',
				type: 'untyped',
				property: 'name',
				operation: '=',
				value: 'Alice',
			};
			bucket.sortToBucket(adjustment);
			expect(bucket.buckets).toEqual({ name: { untyped: adjustment } });
		});

		it('should combine adjustments if bucket already has an adjustment for the property', () => {
			const bucket = new TestSheetPropertyGroupBucket();
			const currentAdjustment: TypedSheetAdjustment = {
				propertyType: null,
				type: 'untyped',
				property: 'name',
				operation: '=',
				value: 'Alice',
			};
			const newAdjustment: TypedSheetAdjustment = {
				propertyType: null,
				type: 'untyped',
				property: 'name',
				operation: '+',
				value: 'Bob',
			};
			bucket.sortToBucket(currentAdjustment);
			bucket.sortToBucket(newAdjustment);
			expect(bucket.buckets).toEqual({
				name: {
					untyped: {
						propertyType: null,
						type: 'untyped',
						property: 'name',
						operation: '=',
						value: 'AliceBob',
					},
				},
			});
		});
		it('should discard adjustments instead of adding if discardAdjustment returns true', () => {
			const bucket = new TestSheetPropertyGroupBucket();
			const currentAdjustment: TypedSheetAdjustment = {
				propertyType: null,
				type: 'untyped',
				property: 'name',
				operation: '=',
				value: 'Alice',
			};
			const newAdjustment: TypedSheetAdjustment = {
				propertyType: null,
				type: 'untyped',
				property: 'name',
				operation: '+',
				value: 'discard',
			};
			bucket.sortToBucket(currentAdjustment);
			bucket.sortToBucket(newAdjustment);
			expect(bucket.buckets).toEqual({
				name: {
					untyped: {
						propertyType: null,
						type: 'untyped',
						property: 'name',
						operation: '=',
						value: 'Alice',
					},
				},
			});
		});

		describe('reduceBuckets', () => {
			it('should return an empty array if buckets is empty', () => {
				const bucket = new TestSheetPropertyGroupBucket();
				const result = bucket.reduceBuckets();
				expect(result).toEqual([]);
			});

			it('should return an array of adjustments if buckets is not empty', () => {
				const bucket = new TestSheetPropertyGroupBucket();
				bucket.sortToBucket({
					propertyType: null,
					type: 'untyped',
					property: 'name',
					operation: '=',
					value: 'Alice',
				});
				bucket.sortToBucket({
					propertyType: null,
					type: 'untyped',
					property: 'name',
					operation: '+',
					value: 'Bob',
				});
				bucket.sortToBucket({
					propertyType: null,
					type: 'untyped',
					property: 'age',
					operation: '=',
					value: '30',
				});
				const result = bucket.reduceBuckets();
				expect(result).toEqual([
					{
						propertyType: null,
						type: 'untyped',
						property: 'name',
						operation: '=',
						value: 'AliceBob',
					},
					{
						propertyType: null,
						type: 'untyped',
						property: 'age',
						operation: '=',
						value: '30',
					},
				]);
			});

			it('Should discard bucket results that return true from discardAdjustment', () => {
				const bucket = new TestSheetPropertyGroupBucket();
				bucket.sortToBucket({
					propertyType: null,
					type: 'untyped',
					property: 'name',
					operation: '=',
					value: 'dis',
				});
				bucket.sortToBucket({
					propertyType: null,
					type: 'untyped',
					property: 'name',
					operation: '+',
					value: 'card',
				});
				bucket.sortToBucket({
					propertyType: null,
					type: 'untyped',
					property: 'age',
					operation: '=',
					value: '30',
				});
				const result = bucket.reduceBuckets();
				expect(result).toEqual([
					{
						propertyType: null,
						type: 'untyped',
						property: 'age',
						operation: '=',
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
				propertyType: 'info',
				type: 'untyped',
				property: 'name',
				operation: '=',
				parsed: 'Alice',
			};
			const newAdjustment: SheetInfoAdjustment = {
				propertyType: 'info',
				type: 'untyped',
				property: 'name',
				operation: '+',
				parsed: 'Bob',
			};
			const result = bucket.combine(currentAdjustment, newAdjustment);
			expect(result).toEqual(newAdjustment);
		});
	});

	describe('discardAdjustment', () => {
		it('should return true if the operation is "+"', () => {
			const bucket = new SheetInfoBucket();
			const adjustment: TypedSheetAdjustment = {
				propertyType: 'info',
				type: 'untyped',
				property: 'name',
				operation: '+',
				value: 'Alice',
			};
			const result = bucket.discardAdjustment(adjustment);
			expect(result).toBe(true);
		});

		it('should return true if the operation is "-"', () => {
			const bucket = new SheetInfoBucket();
			const adjustment: TypedSheetAdjustment = {
				propertyType: 'info',
				type: 'untyped',
				property: 'name',
				operation: '-',
				value: 'Bob',
			};
			const result = bucket.discardAdjustment(adjustment);
			expect(result).toBe(true);
		});

		it('should return false if the operation is =', () => {
			const bucket = new SheetInfoBucket();
			const adjustment: TypedSheetAdjustment = {
				propertyType: 'info',
				type: 'untyped',
				property: 'name',
				operation: '=',
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
				propertyType: 'infoList',
				type: 'untyped',
				property: 'name',
				operation: '=',
				parsed: ['Alice'],
			};
			const newAdjustment: SheetInfoListAdjustment = {
				propertyType: 'infoList',
				type: 'untyped',
				property: 'name',
				operation: '=',
				parsed: ['Bob'],
			};
			const result = bucket.combine(currentAdjustment, newAdjustment);
			expect(result).toEqual(newAdjustment);
		});
		it('should remove values from the new adjustment if operation is "-"', () => {
			const bucket = new SheetInfoListsBucket();
			const currentAdjustment: SheetInfoListAdjustment = {
				propertyType: 'infoList',
				type: 'untyped',
				property: 'name',
				operation: '=',
				parsed: ['Alice', 'Bob', 'Charlie'],
			};
			const newAdjustment: SheetInfoListAdjustment = {
				propertyType: 'infoList',
				type: 'untyped',
				property: 'name',
				operation: '-',
				parsed: ['Alice', 'Charlie'],
			};
			const result = bucket.combine(currentAdjustment, newAdjustment);
			expect(result).toEqual({
				propertyType: 'infoList',
				type: 'untyped',
				property: 'name',
				operation: '=',
				parsed: ['Bob'],
			});
		});

		it('should combine values if operation is "+"', () => {
			const bucket = new SheetInfoListsBucket();
			const currentAdjustment: SheetInfoListAdjustment = {
				propertyType: 'info',
				type: 'untyped',
				property: 'name',
				operation: '=',
				parsed: ['Alice'],
			};
			const newAdjustment: SheetInfoListAdjustment = {
				propertyType: 'info',
				type: 'untyped',
				property: 'name',
				operation: '+',
				parsed: ['Bob'],
			};
			const result = bucket.combine(currentAdjustment, newAdjustment);
			expect(result).toEqual({
				propertyType: 'info',
				type: 'untyped',
				property: 'name',
				operation: '=',
				parsed: ['Alice', 'Bob'],
			});
		});
	});

	describe('discardAdjustment', () => {
		it('should return true if value is empty and operation is "+"', () => {
			const bucket = new SheetInfoListsBucket();
			const adjustment: TypedSheetAdjustment = {
				type: 'untyped',
				propertyType: 'info',
				property: 'name',
				operation: '+',
				value: '',
			};
			const result = bucket.discardAdjustment(adjustment);
			expect(result).toBe(true);
		});

		it('should return true if value is empty and operation is "-"', () => {
			const bucket = new SheetInfoListsBucket();
			const adjustment: TypedSheetAdjustment = {
				type: 'untyped',
				propertyType: 'info',
				property: 'name',
				operation: '-',
				value: '',
			};
			const result = bucket.discardAdjustment(adjustment);
			expect(result).toBe(true);
		});

		it('should return false if value is not empty', () => {
			const bucket = new SheetInfoListsBucket();
			const adjustment: TypedSheetAdjustment = {
				type: 'untyped',
				propertyType: 'info',
				property: 'name',
				operation: '+',
				value: 'Alice',
			};
			const result = bucket.discardAdjustment(adjustment);
			expect(result).toBe(false);
		});

		it('should return false if operation is not "+" or "-"', () => {
			const bucket = new SheetInfoListsBucket();
			const adjustment: TypedSheetAdjustment = {
				type: 'untyped',
				propertyType: 'info',
				property: 'name',
				operation: '=',
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
				type: 'untyped',
				propertyType: 'intProperty',
				property: 'age',
				operation: '=',
				parsed: 30,
			};
			const newAdjustment: SheetIntegerAdjustment = {
				type: 'untyped',
				propertyType: 'intProperty',
				property: 'age',
				operation: '+',
				parsed: 10,
			};
			const result = bucket.combine(currentAdjustment, newAdjustment);
			expect(result).toEqual({
				type: 'untyped',
				propertyType: 'intProperty',
				property: 'age',
				operation: '=',
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
				type: 'status',
				propertyType: 'intProperty',
				operation: '+',
				property: 'strength',
				parsed: 10,
			};
			const newAdjustment: SheetIntegerAdjustment = {
				type: 'status',
				propertyType: 'intProperty',
				operation: '+',
				property: 'strength',
				parsed: 5,
			};
			const result = sheetIntegerPropertyBucket.combineSameType(
				currentAdjustment,
				newAdjustment
			);
			expect(result).toEqual({
				type: 'status',
				propertyType: 'intProperty',
				operation: '+',
				property: 'strength',
				parsed: 10,
			});
		});

		it('should combine two "subtract" adjustments', () => {
			const currentAdjustment: SheetIntegerAdjustment = {
				type: 'status',
				propertyType: 'intProperty',
				operation: '-',
				property: 'strength',
				parsed: 10,
			};
			const newAdjustment: SheetIntegerAdjustment = {
				type: 'status',
				propertyType: 'intProperty',
				operation: '-',
				property: 'strength',
				parsed: 5,
			};
			const result = sheetIntegerPropertyBucket.combineSameType(
				currentAdjustment,
				newAdjustment
			);
			expect(result).toEqual({
				type: 'status',
				propertyType: 'intProperty',
				operation: '-',
				property: 'strength',
				parsed: 5,
			});
		});
	});

	describe('discardAdjustment', () => {
		it('should return true if value is empty and operation is "+" or "-"', () => {
			const bucket = new SheetIntegerPropertyBucket();
			const adjustment: TypedSheetAdjustment = {
				type: 'untyped',
				propertyType: 'intProperty',
				property: 'age',
				operation: '+',
				value: '',
			};
			const result = bucket.discardAdjustment(adjustment);
			expect(result).toBe(true);
		});

		it('should return false if value is not a valid integer', () => {
			const bucket = new SheetIntegerPropertyBucket();
			const adjustment: TypedSheetAdjustment = {
				type: 'untyped',
				propertyType: 'intProperty',
				property: 'age',
				operation: '=',
				value: 'not a number',
			};
			const result = bucket.discardAdjustment(adjustment);
			expect(result).toBe(false);
		});

		it('should return false if operation is not "+" or "-"', () => {
			const bucket = new SheetIntegerPropertyBucket();
			const adjustment: TypedSheetAdjustment = {
				type: 'untyped',
				propertyType: 'intProperty',
				property: 'age',
				operation: '=',
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
		it('should serialize a stat adjustment with total', () => {
			const adjustment: SheetStatAdjustment = {
				type: 'untyped',
				operation: '=',
				property: 'test',
				propertyType: 'stat',
				parsed: {
					total: 10,
				},
			};
			const result = bucket.serialize(adjustment);
			expect(result).toEqual({
				type: 'untyped',
				propertyType: 'stat',
				operation: '=',
				property: 'test',
				value: 'total:10',
			});
		});

		it('should serialize a stat adjustment with proficiency and a totalDC', () => {
			const adjustment: SheetStatAdjustment = {
				type: 'untyped',
				operation: '=',
				property: 'test',
				propertyType: 'stat',
				parsed: {
					proficiency: 2,
					totalDC: 15,
				},
			};
			const result = bucket.serialize(adjustment);
			expect(result).toEqual({
				type: 'untyped',
				propertyType: 'stat',
				operation: '=',
				property: 'test',
				value: 'proficiency:2,totalDC:15',
			});
		});

		it('should serialize a stat adjustment with ability', () => {
			const adjustment: SheetStatAdjustment = {
				type: 'untyped',
				property: 'test',
				operation: '=',
				propertyType: 'stat',
				parsed: {
					ability: 'strength',
				},
			};
			const result = bucket.serialize(adjustment);
			expect(result).toEqual({
				type: 'untyped',
				propertyType: 'stat',
				operation: '=',
				property: 'test',
				value: 'ability:strength',
			});
		});
	});

	describe('deserialize', () => {
		it('should deserialize a stat adjustment with total', () => {
			const adjustment: TypedSheetAdjustment = {
				type: 'untyped',
				operation: '=',
				propertyType: 'stat',
				property: 'test',
				value: 'total:10',
			};
			const result = bucket.deserialize(adjustment);
			expect(result).toEqual({
				type: 'untyped',
				property: 'test',
				operation: '=',
				propertyType: 'stat',
				parsed: {
					total: 10,
				},
			});
		});

		it('should deserialize a stat adjustment with proficiency', () => {
			const adjustment: TypedSheetAdjustment = {
				type: 'untyped',
				operation: '=',
				propertyType: 'stat',
				property: 'test',
				value: 'proficiency:2',
			};
			const result = bucket.deserialize(adjustment);
			expect(result).toEqual({
				type: 'untyped',
				propertyType: 'stat',
				property: 'test',
				operation: '=',
				parsed: {
					proficiency: 2,
				},
			});
		});

		it('should deserialize a stat adjustment with totalDC', () => {
			const adjustment: TypedSheetAdjustment = {
				type: 'untyped',
				operation: '=',
				propertyType: 'stat',
				property: 'test',
				value: 'totalDC:15',
			};
			const result = bucket.deserialize(adjustment);
			expect(result).toEqual({
				type: 'untyped',
				property: 'test',
				propertyType: 'stat',
				operation: '=',
				parsed: {
					totalDC: 15,
				},
			});
		});

		it('should deserialize a stat adjustment with ability', () => {
			const adjustment: TypedSheetAdjustment = {
				type: 'untyped',
				operation: '=',
				propertyType: 'stat',
				property: 'test',
				value: 'ability:strength',
			};
			const result = bucket.deserialize(adjustment);
			expect(result).toEqual({
				type: 'untyped',
				property: 'test',
				propertyType: 'stat',
				operation: '=',
				parsed: {
					ability: 'strength',
				},
			});
		});
	});

	describe('combine', () => {
		it('should combine two stat adjustments with = operation', () => {
			const currentAdjustment: SheetStatAdjustment = {
				type: 'untyped',
				operation: '=',
				property: 'test',
				propertyType: 'stat',
				parsed: {
					total: 10,
					proficiency: 2,
				},
			};
			const newAdjustment: SheetStatAdjustment = {
				type: 'untyped',
				operation: '=',
				property: 'test',
				propertyType: 'stat',
				parsed: {
					totalDC: 15,
					ability: 'strength',
				},
			};
			const result = bucket.combine(currentAdjustment, newAdjustment);
			expect(result).toEqual({
				type: 'untyped',
				operation: '=',
				property: 'test',
				propertyType: 'stat',
				parsed: {
					total: 10,
					proficiency: 2,
					totalDC: 15,
					ability: 'strength',
				},
			});
		});

		it('should combine two stat adjustments with + operation', () => {
			const currentAdjustment: SheetStatAdjustment = {
				type: 'untyped',
				operation: '=',
				property: 'test',
				propertyType: 'stat',
				parsed: {
					total: 10,
					proficiency: 2,
				},
			};
			const newAdjustment: SheetStatAdjustment = {
				type: 'untyped',
				operation: '+',
				property: 'test',
				propertyType: 'stat',
				parsed: {
					total: 5,
					totalDC: 15,
					ability: 'strength',
				},
			};
			const result = bucket.combine(currentAdjustment, newAdjustment);
			expect(result).toEqual({
				type: 'untyped',
				operation: '=',
				property: 'test',
				propertyType: 'stat',
				parsed: {
					total: 15,
					proficiency: 2,
					totalDC: 15,
					ability: 'strength',
				},
			});
		});

		it('should combine two stat adjustments with - operation', () => {
			const currentAdjustment: SheetStatAdjustment = {
				type: 'untyped',
				operation: '=',
				property: 'test',
				propertyType: 'stat',
				parsed: {
					total: 10,
					proficiency: 2,
					totalDC: 15,
					ability: 'strength',
				},
			};
			const newAdjustment: SheetStatAdjustment = {
				type: 'untyped',
				operation: '-',
				property: 'test',
				propertyType: 'stat',
				parsed: {
					total: 5,
					totalDC: 10,
					ability: 'strength',
				},
			};
			const result = bucket.combine(currentAdjustment, newAdjustment);
			expect(result).toEqual({
				type: 'untyped',
				operation: '=',
				property: 'test',
				propertyType: 'stat',
				parsed: {
					total: 5,
					proficiency: 2,
					totalDC: 5,
					ability: null,
				},
			});
		});
	});

	describe('discardAdjustment', () => {
		it('should discard a stat adjustment with empty value and + operation', () => {
			const adjustment: TypedSheetAdjustment = {
				type: 'untyped',
				operation: '+',
				propertyType: 'stat',
				property: 'test',
				value: '',
			};
			const result = bucket.discardAdjustment(adjustment);
			expect(result).toBe(true);
		});

		it('should discard a stat adjustment with empty value and - operation', () => {
			const adjustment: TypedSheetAdjustment = {
				type: 'untyped',
				operation: '-',
				propertyType: 'stat',
				property: 'test',
				value: '',
			};
			const result = bucket.discardAdjustment(adjustment);
			expect(result).toBe(true);
		});

		it('should not discard a stat adjustment with non-empty value and + operation', () => {
			const adjustment: TypedSheetAdjustment = {
				type: 'untyped',
				operation: '+',
				propertyType: 'stat',
				property: 'test',
				value: 'total:10',
			};
			const result = bucket.discardAdjustment(adjustment);
			expect(result).toBe(false);
		});

		it('should not discard a stat adjustment with non-empty value and - operation', () => {
			const adjustment: TypedSheetAdjustment = {
				type: 'untyped',
				operation: '-',
				propertyType: 'stat',
				property: 'test',
				value: 'total:10',
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
			const adjustment: TypedSheetAdjustment = {
				type: 'status',
				propertyType: 'weaknessResistance',
				operation: '+',
				property: 'fire weakness',
				value: '10',
			};
			weaknessResistanceBucket.sortToBucket(adjustment);
			expect(weaknessResistanceBucket.buckets['fire weakness']).toEqual({
				status: { ..._.omit(adjustment, 'value'), parsed: 10 },
			});
		});

		it('should discard an adjustment with an empty value and "+" operation', () => {
			const adjustment: TypedSheetAdjustment = {
				type: 'status',
				propertyType: 'weaknessResistance',
				operation: '+',
				property: 'fire weakness',
				value: '',
			};
			weaknessResistanceBucket.sortToBucket(adjustment);
			expect(weaknessResistanceBucket.buckets['fire weakness']).toBeUndefined();
		});

		it('should discard an adjustment with an empty value and "-" operation', () => {
			const adjustment: TypedSheetAdjustment = {
				type: 'status',
				propertyType: 'weaknessResistance',
				operation: '-',
				property: 'fire resistance',
				value: '',
			};
			weaknessResistanceBucket.sortToBucket(adjustment);
			expect(weaknessResistanceBucket.buckets['fire resistance']).toBeUndefined();
		});

		it('should discard an adjustment with a non-numeric value', () => {
			const adjustment: TypedSheetAdjustment = {
				type: 'status',
				propertyType: 'weaknessResistance',
				operation: '+',
				property: 'fire resistance',
				value: 'not a number',
			};
			weaknessResistanceBucket.sortToBucket(adjustment);
			expect(weaknessResistanceBucket.buckets['fire resistance']).toBeUndefined();
		});
	});

	describe('reduceBuckets', () => {
		it('should reduce the bucket and return the adjustments', () => {
			const adjustment1: TypedSheetAdjustment = {
				type: 'status',
				propertyType: 'weaknessResistance',
				operation: '+',
				property: 'cold weakness',
				value: '10',
			};
			const adjustment2: TypedSheetAdjustment = {
				type: 'status',
				propertyType: 'weaknessResistance',
				operation: '-',
				property: 'cold weakness',
				value: '5',
			};
			const resultAdjustment: TypedSheetAdjustment = {
				type: 'status',
				propertyType: 'weaknessResistance',
				operation: '+',
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
			const adjustment: TypedSheetAdjustment = {
				type: 'untyped',
				propertyType: 'attack',
				operation: '+',
				property: 'fire',
				value: 'attack: 10; damage: 1d4+2',
			};
			const result = attackBucket.discardAdjustment(adjustment);
			expect(result).toBe(true);
		});

		it('should discard an adjustment with "-" operation', () => {
			const adjustment: TypedSheetAdjustment = {
				type: 'untyped',
				propertyType: 'attack',
				operation: '-',
				property: 'claw',
				value: 'attack: 10; damage: 1d4+2',
			};
			const result = attackBucket.discardAdjustment(adjustment);
			expect(result).toBe(true);
		});

		it('should not discard an adjustment with "=" operation', () => {
			const adjustment: TypedSheetAdjustment = {
				type: 'untyped',
				propertyType: 'attack',
				operation: '=',
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
				type: 'untyped',
				propertyType: 'attack',
				operation: '=',
				property: 'claw attack',
				parsed: {
					name: 'claw',
					toHit: 5,
					damage: [{ dice: '1d4+2', type: 'slashing' }],
					range: '10 ft',
					traits: ['agile', 'finesse'],
					notes: 'This is a note',
				},
			};
			const result = attackBucket.serialize(adjustment);
			expect(result.value).toBe(
				'to hit: 5; damage: 1d4+2 slashing; range: 10 ft; traits: agile,finesse; notes: This is a note'
			);
		});
	});

	describe('deserialize', () => {
		it('should deserialize a string to an adjustment', () => {
			const adjustment: TypedSheetAdjustment = {
				type: 'untyped',
				propertyType: 'attack',
				operation: '=',
				property: 'claw attack',
				value: 'to hit: 5; damage: 1d4+2 slashing; range: 10 ft; traits: agile, finesse; notes: This is a note',
			};
			const result = attackBucket.deserialize(adjustment);
			expect(result).toEqual({
				type: 'untyped',
				propertyType: 'attack',
				operation: '=',
				property: 'claw attack',
				parsed: {
					name: 'claw',
					toHit: 5,
					damage: [{ dice: '1d4+2', type: 'slashing' }],
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
				type: 'untyped',
				propertyType: 'attack',
				operation: '=',
				property: 'claw attack',
				parsed: {
					name: 'claw',
					toHit: 5,
					damage: [{ dice: '1d4+2', type: 'slashing' }],
					range: '10 ft',
					traits: ['agile', 'finesse'],
					notes: 'This is a note',
				},
			};
			const newAdjustment: SheetAttackAdjustment = {
				type: 'untyped',
				propertyType: 'attack',
				operation: '=',
				property: 'claw attack',
				parsed: {
					name: 'claw',
					toHit: 10,
					damage: [{ dice: '1d6+3', type: 'slashing' }],
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
