import { Character } from '../../../services/kobold/models/index.js';
import { CalculatedStatsFactory } from '../../../services/wanderers-guide/character-api/factories/calculatedStats.factory.js';
import { CharacterDataFactory } from '../../../services/wanderers-guide/character-api/factories/characterData.factory.js';
import { WG } from '../../../services/wanderers-guide/wanderers-guide.js';
import { CharacterHelpers } from './helpers.js';

describe('CharacterHelpers', () => {
	describe('parseAttributesForCharacter', () => {
		test('parses attributes properly', () => {
			const character: {
				charId: number;
				isActiveCharacter: boolean;
				characterData: WG.CharacterApiResponse;
				calculatedStats: WG.CharacterCalculatedStatsApiResponse;
			} = {
				charId: 5,
				isActiveCharacter: true,
				characterData: CharacterDataFactory.build({
					currentHealth: 10,
					tempHealth: 5,
					level: 2,
					currentResolve: 6,
					currentStamina: 7,
					heroPoints: 3,
					variantStamina: 1,
				}),
				calculatedStats: CalculatedStatsFactory.build({
					maxHP: 30,
					maxStamina: 15,
					maxResolve: 12,
					totalClassDC: 18,
					totalSpeed: 29,
					totalAC: 17,
					totalPerception: 8,
					totalSkills: [
						{ Name: 'Stealth', Bonus: '6' },
						{ Name: 'athletics', Bonus: '3' },
						{ Name: 'Kobold Lore', Bonus: '40' },
					],
					totalSaves: [
						{
							Name: 'Fortitude',
							Bonus: 7,
						},
						{
							Name: 'Reflex',
							Bonus: 12,
						},
						{
							Name: 'Will',
							Bonus: 9,
						},
						{
							Name: 'Kobdobob',
							Bonus: 19,
						},
					],
					totalAbilityScores: [
						{
							Name: 'Strength',
							Score: 10,
						},
						{ Name: 'Dexterity', Score: 18 },
						{ Name: 'Intelligence', Score: 16 },
						{ Name: 'Koboldification', Score: 27 },
					],
				}),
			};
			const attributes = CharacterHelpers.parseAttributesForCharacter(character);
			expect(attributes).toStrictEqual([
				{
					name: 'level',
					tags: ['level'],
					type: 'base',
					value: 2,
				},
				{
					name: 'maxHp',
					tags: ['maxHp'],
					type: 'base',
					value: 30,
				},
				{
					name: 'hp',
					tags: ['hp'],
					type: 'base',
					value: 10,
				},
				{
					name: 'tempHp',
					tags: ['tempHp'],
					type: 'base',
					value: 5,
				},
				{
					name: 'ac',
					tags: ['ac'],
					type: 'base',
					value: 17,
				},
				{
					name: 'heroPoints',
					tags: ['heroPoints'],
					type: 'base',
					value: 3,
				},
				{
					name: 'speed',
					tags: ['speed'],
					type: 'base',
					value: 29,
				},
				{
					name: 'classDc',
					tags: ['classDc'],
					type: 'base',
					value: 18,
				},
				{
					name: 'perception',
					tags: ['skill', 'perception'],
					type: 'skill',
					value: 8,
				},
				{
					name: 'maxStamina',
					tags: ['maxStamina'],
					type: 'base',
					value: 15,
				},
				{
					name: 'maxResolve',
					tags: ['maxResolve'],
					type: 'base',
					value: 12,
				},
				{
					name: 'stamina',
					tags: ['stamina'],
					type: 'base',
					value: 7,
				},
				{
					name: 'resolve',
					tags: ['resolve'],
					type: 'base',
					value: 6,
				},
				{
					name: 'Strength',
					tags: ['ability', 'strength'],
					type: 'ability',
					value: 0,
				},
				{
					name: 'Dexterity',
					tags: ['ability', 'dexterity'],
					type: 'ability',
					value: 4,
				},
				{
					name: 'Intelligence',
					tags: ['ability', 'intelligence'],
					type: 'ability',
					value: 3,
				},
				{
					name: 'Koboldification',
					tags: ['ability', 'koboldification'],
					type: 'ability',
					value: 8,
				},
				{
					name: 'Fortitude',
					tags: ['save', 'fortitude', 'constitution'],
					type: 'save',
					value: 7,
				},
				{
					name: 'Reflex',
					tags: ['save', 'reflex', 'dexterity'],
					type: 'save',
					value: 12,
				},
				{
					name: 'Will',
					tags: ['save', 'will', 'wisdom'],
					type: 'save',
					value: 9,
				},
				{
					name: 'Kobdobob',
					tags: ['save', 'kobdobob'],
					type: 'save',
					value: 19,
				},
				{
					name: 'Stealth',
					tags: ['skill', 'stealth', 'dexterity'],
					type: 'skill',
					value: 6,
				},
				{
					name: 'athletics',
					tags: ['skill', 'athletics', 'strength'],
					type: 'skill',
					value: 3,
				},
				{
					name: 'Kobold Lore',
					tags: ['skill', 'kobold lore', 'intelligence'],
					type: 'skill',
					value: 40,
				},
			]);
		});
	});
});
