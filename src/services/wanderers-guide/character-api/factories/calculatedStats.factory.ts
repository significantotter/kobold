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
		charID: faker.datatype.number({ max: 30 }),
		maxHP: faker.datatype.number({ max: 30 }), //add 5% chance of null
		maxStamina: faker.datatype.number({ max: 30 }),
		maxResolve: faker.datatype.number({ max: 30 }),
		conditions: [],
		totalClassDC: faker.datatype.number({ max: 30 }), //add 5% chance of null
		totalSpeed: faker.datatype.number({ max: 30 }), //add 5% chance of null
		totalAC: faker.datatype.number({ max: 30 }), //add 5% chance of null
		totalPerception: faker.datatype.number({ max: 30 }), //add 5% chance of null
		totalSkills: skills.map(skill => NamedBonusFactory.build({ Name: skill })),
		totalSaves: saves.map(save => NamedBonusFactory.build({ Name: save })),
		totalAbilityScores: abilities.map(ability => NamedScoreFactory.build({ Name: ability })),
		weapons: Array.from({ length: faker.datatype.number(10) }, () => AttackFactory.build()),

		perceptionProfMod: faker.datatype.number({ max: 30 }),
		unarmedProfMod: faker.datatype.number({ max: 30 }),
		simpleWeaponProfMod: faker.datatype.number({ max: 30 }),
		martialWeaponProfMod: faker.datatype.number({ max: 30 }),
		advancedWeaponProfMod: faker.datatype.number({ max: 30 }),
		arcaneSpellDC: faker.datatype.number({ max: 30 }),
		divineSpellDC: faker.datatype.number({ max: 30 }),
		occultSpellDC: faker.datatype.number({ max: 30 }),
		primalSpellDC: faker.datatype.number({ max: 30 }),
		classDCProfMod: faker.datatype.number({ max: 30 }),
		arcaneSpellAttack: faker.datatype.number({ max: 30 }),
		divineSpellAttack: faker.datatype.number({ max: 30 }),
		occultSpellAttack: faker.datatype.number({ max: 30 }),
		primalSpellAttack: faker.datatype.number({ max: 30 }),
		arcaneSpellProfMod: faker.datatype.number({ max: 30 }),
		divineSpellProfMod: faker.datatype.number({ max: 30 }),
		occultSpellProfMod: faker.datatype.number({ max: 30 }),
		primalSpellProfMod: faker.datatype.number({ max: 30 }),

		createdAt: faker.date.recent(30).toISOString(),
		updatedAt: faker.date.recent(30).toISOString(),
	};

	return calculatedStatsData;
});
