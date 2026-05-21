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

		expect(defenses.resistances).toMatchObject([
			{
				label: 'all',
				amount: 10,
				match: {
					all: true,
					except: {
						damageTypes: ['force', 'spirit', 'vitality'],
						traits: ['ghost touch'],
					},
				},
			},
			{
				label: 'all vs non magical',
				amount: 20,
				match: {
					allOf: [
						{
							all: true,
							except: {
								damageTypes: ['force', 'spirit', 'vitality'],
								traits: ['ghost touch'],
							},
						},
						{ traits: ['non magical'] },
					],
				},
			},
		]);
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

	it('parses amount-first resistance and ignores semicolon-only clauses', () => {
		const defenses = parsePf2eDefenses({
			resistanceRaw: '10 physical (except adamantine), ; double resistance vs. non-magical)',
		});

		expect(defenses.resistances).toMatchObject([
			{
				label: 'physical',
				amount: 10,
				automation: 'auto',
				match: {
					damageGroups: ['physical'],
					except: { materials: ['adamantine'] },
				},
			},
		]);
	});

	it('parses amount-first doubled resistance with a conjunctive matcher', () => {
		const defenses = parsePf2eDefenses({
			resistanceRaw: '10 physical (except adamantine; double resistance vs. non-magical)',
		});

		expect(defenses.resistances).toMatchObject([
			{
				label: 'physical',
				amount: 10,
				match: {
					damageGroups: ['physical'],
					except: { materials: ['adamantine'] },
				},
			},
			{
				label: 'physical vs non magical',
				amount: 20,
				match: {
					allOf: [
						{
							damageGroups: ['physical'],
							except: { materials: ['adamantine'] },
						},
						{ traits: ['non magical'] },
					],
				},
			},
		]);
	});

	it('keeps targetless amount rules partial instead of manual', () => {
		const defenses = parsePf2eDefenses({
			resistanceRaw: '10 (except adamantine)',
		});

		expect(defenses.resistances).toMatchObject([
			{
				label: 'unspecified',
				amount: 10,
				automation: 'partial',
				match: {
					except: { materials: ['adamantine'] },
				},
			},
		]);
	});

	it('allows new numeric damage types without parser code changes', () => {
		const defenses = parsePf2eDefenses({
			weaknessRaw: 'plasma 5',
		});

		expect(defenses.weaknesses).toMatchObject([
			{
				label: 'plasma',
				amount: 5,
				automation: 'auto',
				match: { damageTypes: ['plasma'] },
			},
		]);
	});

	it('expands grouped defenses with a shared amount', () => {
		const defenses = parsePf2eDefenses({
			resistanceRaw: 'acid, electricity, or sonic 1 (chosen randomly each day)',
		});

		expect(defenses.resistances).toMatchObject([
			{ label: 'acid', amount: 1, automation: 'auto', match: { damageTypes: ['acid'] } },
			{
				label: 'electricity',
				amount: 1,
				automation: 'auto',
				match: { damageTypes: ['electricity'] },
			},
			{ label: 'sonic', amount: 1, automation: 'auto', match: { damageTypes: ['sonic'] } },
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
