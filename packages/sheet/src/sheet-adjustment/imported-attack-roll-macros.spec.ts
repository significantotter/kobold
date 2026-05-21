import { describe, expect, it } from 'vitest';
import { buildTwoHandRollMacrosForAttacks } from './sheet-import-utils.js';

describe('buildTwoHandRollMacrosForAttacks', () => {
	it('creates two-hand roll macros from imported attacks', () => {
		const macros = buildTwoHandRollMacrosForAttacks([
			{
				name: 'Bastard Sword',
				toHit: 12,
				damage: [
					{
						dice: '2d8+4',
						type: 'slashing',
						tags: [],
						mode: 'damage',
						persistent: false,
					},
				],
				effects: [],
				range: null,
				traits: ['two-hand 1d12'],
				notes: null,
			},
		]);

		expect(macros).toEqual([{ name: 'bastard-sword-two-hand', macro: '2d12+4' }]);
	});

	it('ignores attacks without two-hand traits', () => {
		const macros = buildTwoHandRollMacrosForAttacks([
			{
				name: 'Longsword',
				toHit: 12,
				damage: [
					{
						dice: '1d8+4',
						type: 'slashing',
						tags: [],
						mode: 'damage',
						persistent: false,
					},
				],
				effects: [],
				range: null,
				traits: ['versatile p'],
				notes: null,
			},
		]);

		expect(macros).toEqual([]);
	});
});
