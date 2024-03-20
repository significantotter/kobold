import { ModifierHelpers } from './modifier-helpers.js';
import { KoboldError } from '../../../utils/KoboldError.js';

describe('ModifierHelpers', () => {
	describe('validateSeverity', () => {
		it('should return null for non-severity values', () => {
			const nonSeverityValues = [null, 'null', 'none', 'x', 'no', 'false'];
			nonSeverityValues.forEach(value => {
				expect(ModifierHelpers.validateSeverity(value)).toBeNull();
			});
		});

		it('should return number for numeric severity values', () => {
			expect(ModifierHelpers.validateSeverity('5')).toBe(5);
			expect(ModifierHelpers.validateSeverity('0')).toBe(0);
		});

		it('should throw KoboldError for non-numeric and non-null values', () => {
			expect(() => ModifierHelpers.validateSeverity('abc')).toThrow(KoboldError);
			expect(() => ModifierHelpers.validateSeverity('true')).toThrow(KoboldError);
		});
	});
});
