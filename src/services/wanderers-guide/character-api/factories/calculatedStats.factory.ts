import { AttackFactory } from './attack.factory.js';
import { skills, abilities, saves } from './../../../../constants/pathfinder.js';
import { Factory } from 'fishery';
import type { DeepPartial } from 'fishery';
import type { WG } from '../../wanderers-guide.js';
import { faker } from '@faker-js/faker';
import { NamedBonusFactory } from './namedBonus.factory.js';
import { NamedScoreFactory } from './namedScore.factory.js';

type CalculatedStatsTransientParams = {};

class CalculatedStatsFactoryClass extends Factory<
	WG.CharacterCalculatedStatsApiResponse,
	CalculatedStatsTransientParams,
	WG.CharacterCalculatedStatsApiResponse
> {}

export const CalculatedStatsFactory = CalculatedStatsFactoryClass.define(() => {
	const calculatedStatsData: DeepPartial<WG.CharacterCalculatedStatsApiResponse> = {
		charID: faker.number.int({ max: 30 }),
		maxHP: faker.number.int({ max: 30 }), //add 5% chance of null
		maxStamina: faker.number.int({ max: 30 }),
		maxResolve: faker.number.int({ max: 30 }),
		conditions: [],
		totalClassDC: faker.number.int({ max: 30 }), //add 5% chance of null
		totalSpeed: faker.number.int({ max: 30 }), //add 5% chance of null
		totalAC: faker.number.int({ max: 30 }), //add 5% chance of null
		totalPerception: faker.number.int({ max: 30 }), //add 5% chance of null
		totalSkills: skills.map(skill => NamedBonusFactory.build({ Name: skill })),
		totalSaves: saves.map(save => NamedBonusFactory.build({ Name: save })),
		totalAbilityScores: abilities.map(ability => NamedScoreFactory.build({ Name: ability })),
		weapons: Array.from({ length: faker.number.int(10) }, () => AttackFactory.build()),

		perceptionProfMod: faker.number.int({ max: 30 }),
		unarmedProfMod: faker.number.int({ max: 30 }),
		simpleWeaponProfMod: faker.number.int({ max: 30 }),
		martialWeaponProfMod: faker.number.int({ max: 30 }),
		advancedWeaponProfMod: faker.number.int({ max: 30 }),
		arcaneSpellDC: faker.number.int({ max: 30 }),
		divineSpellDC: faker.number.int({ max: 30 }),
		occultSpellDC: faker.number.int({ max: 30 }),
		primalSpellDC: faker.number.int({ max: 30 }),
		classDCProfMod: faker.number.int({ max: 30 }),
		arcaneSpellAttack: faker.number.int({ max: 30 }),
		divineSpellAttack: faker.number.int({ max: 30 }),
		occultSpellAttack: faker.number.int({ max: 30 }),
		primalSpellAttack: faker.number.int({ max: 30 }),
		arcaneSpellProfMod: faker.number.int({ max: 30 }),
		divineSpellProfMod: faker.number.int({ max: 30 }),
		occultSpellProfMod: faker.number.int({ max: 30 }),
		primalSpellProfMod: faker.number.int({ max: 30 }),

		createdAt: faker.date.recent({ days: 30 }).toISOString(),
		updatedAt: faker.date.recent({ days: 30 }).toISOString(),
	};

	return calculatedStatsData;
});
