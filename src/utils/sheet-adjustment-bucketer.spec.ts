import {
	SheetPropertyGroupBucket,
	SheetInfoBucket,
	SheetInfoListsBucket,
	IntPropertyBucket,
	StatBucket,
	SheetPropertyGroupAdjustment,
} from './sheet-adjustment-bucketer.js';
import { TypedSheetAdjustment } from './sheet-utils.js';

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
			const currentAdjustment: TypedSheetAdjustment = {
				propertyType: 'info',
				type: 'untyped',
				property: 'name',
				operation: '=',
				value: 'Alice',
			};
			const newAdjustment: TypedSheetAdjustment = {
				propertyType: 'info',
				type: 'untyped',
				property: 'name',
				operation: '+',
				value: 'Bob',
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
			const currentAdjustment: TypedSheetAdjustment = {
				propertyType: 'infoList',
				type: 'untyped',
				property: 'name',
				operation: '=',
				value: 'Alice',
			};
			const newAdjustment: TypedSheetAdjustment = {
				propertyType: 'infoList',
				type: 'untyped',
				property: 'name',
				operation: '=',
				value: 'Bob',
			};
			const result = bucket.combine(currentAdjustment, newAdjustment);
			expect(result).toEqual(newAdjustment);
		});

		it('should combine values if operation is "+"', () => {
			const bucket = new SheetInfoListsBucket();
			const currentAdjustment: TypedSheetAdjustment = {
				propertyType: 'info',
				type: 'untyped',
				property: 'name',
				operation: '=',
				value: 'Alice',
			};
			const newAdjustment: TypedSheetAdjustment = {
				propertyType: 'info',
				type: 'untyped',
				property: 'name',
				operation: '+',
				value: 'Bob',
			};
			const result = bucket.combine(currentAdjustment, newAdjustment);
			expect(result).toEqual({
				propertyType: 'info',
				type: 'untyped',
				property: 'name',
				operation: '+',
				value: 'Alice,Bob',
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
describe('IntPropertyBucket', () => {
	describe('combineAdjustments', () => {
		it('should combine numeric values using addition', () => {
			const bucket = new IntPropertyBucket();
			const currentAdjustment: TypedSheetAdjustment = {
				type: 'untyped',
				propertyType: 'intProperty',
				property: 'age',
				operation: '=',
				value: '30',
			};
			const newAdjustment: TypedSheetAdjustment = {
				type: 'untyped',
				propertyType: 'intProperty',
				property: 'age',
				operation: '+',
				value: '10',
			};
			const result = bucket.combine(currentAdjustment, newAdjustment);
			expect(result).toEqual({
				type: 'untyped',
				propertyType: 'intProperty',
				property: 'age',
				operation: '=',
				value: '40',
			});
		});

		it('should handle empty string values as 0', () => {
			const bucket = new IntPropertyBucket();
			const currentAdjustment: TypedSheetAdjustment = {
				type: 'untyped',
				propertyType: 'intProperty',
				property: 'age',
				operation: '=',
				value: '30',
			};
			const newAdjustment: TypedSheetAdjustment = {
				type: 'untyped',
				propertyType: 'intProperty',
				property: 'age',
				operation: '+',
				value: '',
			};
			const result = bucket.combine(currentAdjustment, newAdjustment);
			expect(result).toEqual({
				type: 'untyped',
				propertyType: 'intProperty',
				property: 'age',
				operation: '=',
				value: '30',
			});
		});
	});

	describe('discardAdjustment', () => {
		it('should return true if value is empty and operation is "+" or "-"', () => {
			const bucket = new IntPropertyBucket();
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
			const bucket = new IntPropertyBucket();
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
			const bucket = new IntPropertyBucket();
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
			const adjustment: SheetPropertyGroupAdjustment = {
				type: 'untyped',
				operation: '=',
				property: 'test',
				stat: {
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
			const adjustment: SheetPropertyGroupAdjustment = {
				type: 'untyped',
				operation: '=',
				property: 'test',
				stat: {
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
			const adjustment: SheetPropertyGroupAdjustment = {
				type: 'untyped',
				property: 'test',
				operation: '=',
				stat: {
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
				stat: {
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
				stat: {
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
				stat: {
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
				stat: {
					ability: 'strength',
				},
			});
		});
	});

	describe('combine', () => {
		it('should combine two stat adjustments with = operation', () => {
			const currentAdjustment: SheetPropertyGroupAdjustment = {
				type: 'untyped',
				operation: '=',
				property: 'test',
				stat: {
					total: 10,
					proficiency: 2,
				},
			};
			const newAdjustment: SheetPropertyGroupAdjustment = {
				type: 'untyped',
				operation: '=',
				property: 'test',
				stat: {
					totalDC: 15,
					ability: 'strength',
				},
			};
			const result = bucket.combine(currentAdjustment, newAdjustment);
			expect(result).toEqual({
				type: 'untyped',
				operation: '=',
				property: 'test',
				stat: {
					total: 10,
					proficiency: 2,
					totalDC: 15,
					ability: 'strength',
				},
			});
		});

		it('should combine two stat adjustments with + operation', () => {
			const currentAdjustment: SheetPropertyGroupAdjustment = {
				type: 'untyped',
				operation: '=',
				property: 'test',
				stat: {
					total: 10,
					proficiency: 2,
				},
			};
			const newAdjustment: SheetPropertyGroupAdjustment = {
				type: 'untyped',
				operation: '+',
				property: 'test',
				stat: {
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
				stat: {
					total: 15,
					proficiency: 2,
					totalDC: 15,
					ability: 'strength',
				},
			});
		});

		it('should combine two stat adjustments with - operation', () => {
			const currentAdjustment: SheetPropertyGroupAdjustment = {
				type: 'untyped',
				operation: '=',
				property: 'test',
				stat: {
					total: 10,
					proficiency: 2,
					totalDC: 15,
					ability: 'strength',
				},
			};
			const newAdjustment: SheetPropertyGroupAdjustment = {
				type: 'untyped',
				operation: '-',
				property: 'test',
				stat: {
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
				stat: {
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
