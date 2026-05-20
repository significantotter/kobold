import { describe, expect, it } from 'vitest';
import { convertPathBuilderToSheet } from './sheet-import-pathbuilder.js';

const baseCharacter = {
	name: 'Ren',
	level: 10,
	keyability: 'str',
	mods: {},
	abilities: { str: 18, dex: 18, con: 12, int: 10, wis: 10, cha: 10 },
	attributes: {
		ancestryhp: 8,
		bonushp: 0,
		classhp: 8,
		bonushpPerLevel: 0,
		speed: 25,
		speedBonus: 0,
	},
	spellCasters: [],
	focus: {},
	proficiencies: {
		classDC: 0,
		perception: 0,
		fortitude: 0,
		reflex: 0,
		will: 0,
		acrobatics: 0,
		arcana: 0,
		athletics: 0,
		crafting: 0,
		deception: 0,
		diplomacy: 0,
		intimidation: 0,
		medicine: 0,
		nature: 0,
		occultism: 0,
		performance: 0,
		religion: 0,
		society: 0,
		stealth: 0,
		survival: 0,
		thievery: 0,
		martial: 0,
		simple: 0,
		unarmed: 0,
		advanced: 0,
		heavy: 0,
		medium: 0,
		light: 0,
		unarmored: 0,
	},
	specificProficiencies: { trained: [], expert: [], master: [], legendary: [] },
	lores: [],
	gender: null,
	age: null,
	alignment: null,
	deity: null,
	size: 2,
	class: 'Monk',
	ancestry: 'Human',
	heritage: 'Versatile Human',
	background: 'Warrior',
	languages: ['Common'],
	acTotal: { acTotal: 30 },
	focusPoints: 0,
	weapons: [],
};

describe('convertPathBuilderToSheet nethys enrichment', () => {
	it('enriches sparse Pathbuilder weapon exports with Nethys weapon and rune metadata', () => {
		const sheet = convertPathBuilderToSheet(
			{
				...baseCharacter,
				weapons: [
					{
						name: 'Gakgung',
						die: 'd6',
						str: 'greaterStriking',
						mat: null,
						runes: ['Flaming', 'Shock'],
						damageType: 'P',
						attack: 23,
						damageBonus: 4,
						extraDamage: ['1d6 Fire', '1d6 Electricity'],
					},
				],
			} as any,
			{
				useStamina: false,
				nethysCompendiumEntries: [
					{
						name: 'Gakgung',
						item_category: 'Weapons',
						item_subcategory: 'Base Weapons',
						range_raw: '100 ft.',
						trait_raw: ['Deadly d8', 'Monk', 'Propulsive'],
					},
					{
						name: 'Flaming',
						item_category: 'Runes',
						item_subcategory: 'Weapon Property Runes',
						trait: ['Fire', 'Magical'],
					},
					{
						name: 'Shock',
						item_category: 'Runes',
						item_subcategory: 'Weapon Property Runes',
						trait: ['Electricity', 'Magical'],
					},
				],
			}
		);

		expect(sheet.attacks[0]).toMatchObject({
			range: '100 ft.',
			traits: ['Deadly d8', 'Monk', 'Propulsive', 'Fire', 'Magical', 'Electricity'],
		});
		expect(sheet.attacks[0].damage).toMatchObject([
			{
				dice: '3d6+ 4',
				type: 'P',
				tags: expect.any(Array),
				mode: 'damage',
				persistent: false,
			},
			{
				dice: '1d6',
				type: 'Fire',
				tags: expect.any(Array),
				mode: 'damage',
				persistent: false,
			},
			{
				dice: '1d6',
				type: 'Electricity',
				tags: expect.any(Array),
				mode: 'damage',
				persistent: false,
			},
		]);
	});

	it('falls back to sparse Pathbuilder data when no metadata matches', () => {
		const sheet = convertPathBuilderToSheet(
			{
				...baseCharacter,
				weapons: [
					{
						name: 'Mystery Stick',
						die: 'd4',
						str: '',
						mat: null,
						runes: [],
						damageType: 'B',
						attack: 5,
						damageBonus: 1,
						extraDamage: [],
					},
				],
			} as any,
			{ useStamina: false }
		);

		expect(sheet.attacks[0]).toMatchObject({
			name: 'Mystery Stick',
			range: null,
			traits: [],
			damage: [
				{
					dice: '1d4+ 1',
					type: 'B',
					tags: expect.any(Array),
					mode: 'damage',
					persistent: false,
				},
			],
		});
	});
});
