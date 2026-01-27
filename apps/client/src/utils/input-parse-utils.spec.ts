import { KoboldError } from './KoboldError.js';
import { InputParseUtils } from './input-parse-utils.js';

describe('InputParseUtils', () => {
	describe('parseAsNullableNumber', () => {
		it('should return null for non-severity values', () => {
			const nonSeverityValues = [
				null,
				'-',
				'no',
				'none',
				'null',
				'clear',
				'remove',
				'x',
				'',
				'.',
				'""',
				"''",
				'``',
			];
			nonSeverityValues.forEach(value => {
				expect(InputParseUtils.parseAsNullableNumber(value)).toBeNull();
			});
		});

		it('should return number for numeric severity values', () => {
			expect(InputParseUtils.parseAsNullableNumber('5')).toBe(5);
			expect(InputParseUtils.parseAsNullableNumber('0')).toBe(0);
		});

		it('should throw KoboldError for non-numeric and non-null values', () => {
			expect(() => InputParseUtils.parseAsNullableNumber('abc')).toThrow(KoboldError);
			expect(() => InputParseUtils.parseAsNullableNumber('true')).toThrow(KoboldError);
		});
	});
});
