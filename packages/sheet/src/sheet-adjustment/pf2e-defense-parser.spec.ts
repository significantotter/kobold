import { describe, expect, it } from 'vitest';
import { parsePf2eDefenses } from './pf2e-defense-parser.js';

describe('parsePf2eDefenses', () => {
	it('parses common resistance exceptions', () => {
		const defenses = parsePf2eDefenses({
			resistanceRaw: 'physical 5 (except adamantine)',
		});

		expect(defenses.resistances).toMatchObject([
			{
				label: 'physical',
				amount: 5,
				match: {
					damageGroups: ['physical'],
					except: { materials: ['adamantine'] },
				},
			},
		]);
	});

	it('parses all damage resistance with exception traits', () => {
		const defenses = parsePf2eDefenses({
			resistanceRaw:
				'all damage 10 (except force, ghost touch, spirit, or vitality; double resistance vs. non-magical)',
		});

		expect(defenses.resistances[0]).toMatchObject({
			label: 'all',
			amount: 10,
			match: {
				all: true,
				except: {
					damageTypes: ['force', 'spirit', 'vitality'],
					traits: ['ghost touch'],
				},
			},
		});
	});

	it('parses area and splash weaknesses independently', () => {
		const defenses = parsePf2eDefenses({
			weaknessRaw: 'area damage 4, splash damage 4',
		});

		expect(defenses.weaknesses).toMatchObject([
			{ label: 'area', amount: 4, match: { traits: ['area'] } },
			{ label: 'splash', amount: 4, match: { traits: ['splash'] } },
		]);
	});

	it('parses special immunities', () => {
		const defenses = parsePf2eDefenses({
			immunityRaw: 'critical hits, precision, nonlethal attacks',
		});

		expect(defenses.immunities.map(rule => rule.appliesTo)).toEqual([
			['critical-hit'],
			['damage'],
			['nonlethal', 'damage', 'effect'],
		]);
		expect(defenses.immunities.map(rule => rule.label)).toEqual([
			'critical hits',
			'precision',
			'nonlethal attacks',
		]);
	});

	it('preserves named weaknesses as manual rules', () => {
		const defenses = parsePf2eDefenses({
			weaknessRaw: 'vampire weaknesses',
		});

		expect(defenses.weaknesses).toMatchObject([
			{
				label: 'vampire weaknesses',
				automation: 'manual',
			},
		]);
	});
});
