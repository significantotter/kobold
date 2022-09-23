import { Factory } from 'fishery';
import type { DeepPartial } from 'fishery';
import type { WG } from '../wanderers-guide.js';
import { faker } from '@faker-js/faker';

type CharacterDataTransientParams = {};

class CharacterDataFactoryClass extends Factory<
	WG.CharacterApiResponse,
	CharacterDataTransientParams,
	WG.CharacterApiResponse
> {}

export const CharacterDataFactory = CharacterDataFactoryClass.define(() => {
	const maxHealth = faker.datatype.number({ min: 10, max: 200 });
	return {
		id: faker.datatype.number(),
		userID: faker.datatype.number(),
		buildID: faker.helpers.maybe(() => faker.datatype.number(), { probability: 0.1 }),
		name: faker.name.firstName(),
		level: faker.datatype.number({ min: 1, max: 20 }),
		experience: faker.datatype.number({ min: 0, max: 999 }),
		currentHealth: faker.datatype.number({ min: 0, max: maxHealth }),
		tempHealth: faker.helpers.maybe(() => faker.datatype.number({ min: 1, max: 10 }), {
			probability: 0.1,
		}),
		heroPoints: faker.datatype.number({ min: 0, max: 3 }),
		ancestryID: faker.helpers.maybe(() => faker.datatype.number(), { probability: 0.1 }),
		heritageID: faker.helpers.maybe(() => faker.datatype.number(), { probability: 0.1 }),
		uniHeritageID: faker.helpers.maybe(() => faker.datatype.number(), { probability: 0.1 }),
		backgroundID: faker.helpers.maybe(() => faker.datatype.number(), { probability: 0.1 }),
		classID: faker.helpers.maybe(() => faker.datatype.number(), { probability: 0.1 }),
		classID_2: faker.helpers.maybe(() => faker.datatype.number(), { probability: 0.1 }),
		inventoryID: faker.datatype.number(),
		notes: null,
		infoJSON: { imageUrl: faker.internet.url(), pronouns: faker.random.words(2) },
		rollHistoryJSON: {},
		details: {},
		customCode: {},
		dataID: faker.helpers.maybe(() => faker.datatype.number(), { probability: 0.1 }),
		currentStamina: faker.helpers.maybe(() => faker.datatype.number({ max: 20 }), {
			probability: 0.1,
		}),
		currentResolve: faker.helpers.maybe(() => faker.datatype.number({ max: 20 }), {
			probability: 0.1,
		}),
		builderByLevel: faker.datatype.number({ min: 0, max: 1 }),
		optionAutoDetectPreReqs: faker.datatype.number({ min: 0, max: 1 }),
		optionAutoHeightenSpells: faker.datatype.number({ min: 0, max: 1 }),
		optionPublicCharacter: faker.datatype.number({ min: 0, max: 1 }),
		optionCustomCodeBlock: faker.datatype.number({ min: 0, max: 1 }),
		optionDiceRoller: faker.datatype.number({ min: 0, max: 1 }),
		optionClassArchetypes: faker.datatype.number({ min: 0, max: 1 }),
		optionIgnoreBulk: faker.datatype.number({ min: 0, max: 1 }),
		variantProfWithoutLevel: faker.datatype.number({ min: 0, max: 1 }),
		variantFreeArchetype: faker.datatype.number({ min: 0, max: 1 }),
		variantAncestryParagon: faker.datatype.number({ min: 0, max: 1 }),
		variantStamina: faker.datatype.number({ min: 0, max: 1 }),
		variantAutoBonusProgression: faker.datatype.number({ min: 0, max: 1 }),
		variantGradualAbilityBoosts: faker.datatype.number({ min: 0, max: 1 }),
		enabledSources: Array.from({ length: faker.datatype.number(20) }, () =>
			faker.random.word()
		),
		enabledHomebrew: Array.from({ length: faker.datatype.number(4) }, () =>
			faker.random.word()
		),
		createdAt: faker.date.recent(30).toISOString(),
		updatedAt: faker.date.recent(30).toISOString(),
	};
});
