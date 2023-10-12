import { SheetAdjuster } from './sheet-adjuster.js';

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
