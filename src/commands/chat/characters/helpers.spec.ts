import { CalculatedStatsFactory } from '../../../services/wanderers-guide/character-api/factories/calculatedStats.factory.js';
import { CharacterDataFactory } from '../../../services/wanderers-guide/character-api/factories/characterData.factory.js';
import { WG } from '../../../services/wanderers-guide/wanderers-guide.js';

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
		});
	});
});
