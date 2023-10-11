import { SheetAdjuster, SheetInfoBucket } from './sheet-adjuster.js';
import { TypedSheetAdjustment } from './sheet-utils.js';

describe('SheetAdjuster', () => {
	describe('validateSheetProperty', () => {
		it('should return true if the property is valid', () => {
			expect(SheetAdjuster.validateSheetProperty('image-link')).toBe(true);
			// expect(SheetAdjuster.validateSheetProperty('ac')).toBe(true);
			// expect(SheetAdjuster.validateSheetProperty('classDC')).toBe(true);
			// expect(SheetAdjuster.validateSheetProperty('arcaneAttack')).toBe(true);
			expect(SheetAdjuster.validateSheetProperty('esoteric lore')).toBe(true);
			expect(SheetAdjuster.validateSheetProperty('weakness')).toBe(true);
			expect(SheetAdjuster.validateSheetProperty('resistance')).toBe(true);
			expect(SheetAdjuster.validateSheetProperty('sense')).toBe(true);
			expect(SheetAdjuster.validateSheetProperty('immunity')).toBe(true);
			expect(SheetAdjuster.validateSheetProperty('language')).toBe(true);
			// expect(SheetAdjuster.validateSheetProperty('a c')).toBe(true);
			expect(SheetAdjuster.validateSheetProperty('str skills')).toBe(true);
			expect(SheetAdjuster.validateSheetProperty('checks')).toBe(true);
		});
		it('should return false if the property is invalid', () => {
			expect(SheetAdjuster.validateSheetProperty('foo checks')).toBe(false);
			expect(SheetAdjuster.validateSheetProperty('str foo')).toBe(false);
			expect(SheetAdjuster.validateSheetProperty('bar')).toBe(false);
		});
	});
});

describe('SheetInfoBucket', () => {
	describe('combine', () => {
		it('should return new adjustment if operation is "="', () => {
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

		it('should combine values if operation is "+"', () => {
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
			expect(result).toEqual({ property: 'name', operation: '+', value: 'AliceBob' });
		});
	});

	describe('sortToBucket', () => {
		it('should add new adjustment to bucket if bucket is empty', () => {
			const bucket = new SheetInfoBucket();
			const adjustment: TypedSheetAdjustment = {
				propertyType: 'info',
				type: 'untyped',
				property: 'name',
				operation: '=',
				value: 'Alice',
			};
			bucket.sortToBucket(adjustment);
			expect(bucket.buckets).toEqual({ name: adjustment });
		});

		it('should combine adjustments if bucket already has an adjustment for the property', () => {
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
			bucket.sortToBucket(currentAdjustment);
			bucket.sortToBucket(newAdjustment);
			expect(bucket.buckets).toEqual({
				name: { property: 'name', operation: '+', value: 'AliceBob' },
			});
		});
	});

	describe('discardAdjustment', () => {
		it('should return true if value is empty and operation is "+"', () => {
			const bucket = new SheetInfoBucket();
			const adjustment: TypedSheetAdjustment = {
				propertyType: 'info',
				type: 'untyped',
				property: 'name',
				operation: '+',
				value: '',
			};
			const result = bucket.discardAdjustment(adjustment);
			expect(result).toBe(true);
		});

		it('should return true if value is empty and operation is "-"', () => {
			const bucket = new SheetInfoBucket();
			const adjustment: TypedSheetAdjustment = {
				propertyType: 'info',
				type: 'untyped',
				property: 'name',
				operation: '-',
				value: '',
			};
			const result = bucket.discardAdjustment(adjustment);
			expect(result).toBe(true);
		});

		it('should return false if value is not empty', () => {
			const bucket = new SheetInfoBucket();
			const adjustment: TypedSheetAdjustment = {
				propertyType: 'info',
				type: 'untyped',
				property: 'name',
				operation: '+',
				value: 'Alice',
			};
			const result = bucket.discardAdjustment(adjustment);
			expect(result).toBe(false);
		});

		it('should return false if operation is not "+" or "-"', () => {
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
