import { describe, expect, it } from 'vitest';
import { zSheetStaticInfo } from './sheet.zod.js';

describe('zSheetStaticInfo', () => {
	it('normalizes missing keyAbility to null', () => {
		expect(
			zSheetStaticInfo.parse({
				name: 'Custom',
				level: null,
				usesStamina: false,
			}).keyAbility
		).toBeNull();
	});

	it('rejects invalid keyAbility values', () => {
		expect(() =>
			zSheetStaticInfo.parse({
				name: 'Custom',
				level: null,
				keyAbility: '',
				usesStamina: false,
			})
		).toThrow();
	});
});
