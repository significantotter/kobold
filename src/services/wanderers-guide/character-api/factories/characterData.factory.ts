import { Factory } from 'fishery';
import type { DeepPartial } from 'fishery';
import type { WG } from '../../wanderers-guide.js';
import { faker } from '@faker-js/faker';

type CharacterDataTransientParams = {};

class CharacterDataFactoryClass extends Factory<
	WG.CharacterApiResponse,
	CharacterDataTransientParams,
	WG.CharacterApiResponse
> {}

export const CharacterDataFactory = CharacterDataFactoryClass.define(() => {
	const maxHealth = faker.number.int({ min: 10, max: 200 });
	return {
		id: faker.number.int(2147483647),
		userID: faker.number.int(2147483647),
		buildID: faker.helpers.maybe(() => faker.number.int(2147483647), { probability: 0.1 }),
		name: faker.person.firstName(),
		level: faker.number.int({ min: 1, max: 20 }),
		experience: faker.number.int({ min: 0, max: 999 }),
		currentHealth: faker.number.int({ min: 0, max: maxHealth }),
		tempHealth: faker.helpers.maybe(() => faker.number.int({ min: 1, max: 10 }), {
			probability: 0.1,
		}),
		heroPoints: faker.number.int({ min: 0, max: 3 }),
		ancestryID: faker.helpers.maybe(() => faker.number.int(2147483647), { probability: 0.1 }),
		heritageID: faker.helpers.maybe(() => faker.number.int(2147483647), { probability: 0.1 }),
		uniHeritageID: faker.helpers.maybe(() => faker.number.int(2147483647), {
			probability: 0.1,
		}),
		backgroundID: faker.helpers.maybe(() => faker.number.int(2147483647), { probability: 0.1 }),
		classID: faker.helpers.maybe(() => faker.number.int(2147483647), { probability: 0.1 }),
		classID_2: faker.helpers.maybe(() => faker.number.int(2147483647), { probability: 0.1 }),
		inventoryID: faker.number.int(2147483647),
		notes: null,
		infoJSON: { imageURL: faker.internet.url(), pronouns: faker.word.words(2) },
		rollHistoryJSON: {},
		details: {},
		customCode: {},
		dataID: faker.helpers.maybe(() => faker.number.int(2147483647), { probability: 0.1 }),
		currentStamina: faker.helpers.maybe(() => faker.number.int({ max: 20 }), {
			probability: 0.1,
		}),
		currentResolve: faker.helpers.maybe(() => faker.number.int({ max: 20 }), {
			probability: 0.1,
		}),
		builderByLevel: faker.number.int({ min: 0, max: 1 }),
		optionAutoDetectPreReqs: faker.number.int({ min: 0, max: 1 }),
		optionAutoHeightenSpells: faker.number.int({ min: 0, max: 1 }),
		optionPublicCharacter: faker.number.int({ min: 0, max: 1 }),
		optionCustomCodeBlock: faker.number.int({ min: 0, max: 1 }),
		optionDiceRoller: faker.number.int({ min: 0, max: 1 }),
		optionClassArchetypes: faker.number.int({ min: 0, max: 1 }),
		optionIgnoreBulk: faker.number.int({ min: 0, max: 1 }),
		variantProfWithoutLevel: faker.number.int({ min: 0, max: 1 }),
		variantFreeArchetype: faker.number.int({ min: 0, max: 1 }),
		variantAncestryParagon: faker.number.int({ min: 0, max: 1 }),
		variantStamina: faker.number.int({ min: 0, max: 1 }),
		variantAutoBonusProgression: faker.number.int({ min: 0, max: 1 }),
		variantGradualAbilityBoosts: faker.number.int({ min: 0, max: 1 }),
		enabledSources: Array.from({ length: faker.number.int(20) }, () => faker.word.noun()),
		enabledHomebrew: Array.from({ length: faker.number.int(4) }, () => faker.word.noun()),
		createdAt: faker.date.recent({ days: 30 }).toISOString(),
		updatedAt: faker.date.recent({ days: 30 }).toISOString(),
	};
});
