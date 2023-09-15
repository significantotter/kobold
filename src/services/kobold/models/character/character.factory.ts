import { CharacterDataFactory } from './../../../wanderers-guide/character-api/factories/characterData.factory.js';
import { CalculatedStatsFactory } from './../../../wanderers-guide/character-api/factories/calculatedStats.factory.js';
import { Factory } from 'fishery';
import type { DeepPartial } from 'fishery';
import { Character } from './character.model.js';
import { faker } from '@faker-js/faker';
import { WG } from '../../../wanderers-guide/wanderers-guide.js';

export function createRandomModifiers(times: number): Character['modifiers'] {
	const modifiers = [];
	for (let i = 0; i < times; i++) {
		const modifier = {
			name: faker.word.noun(),
			description: faker.word.words(5),
			isActive: faker.datatype.boolean(),
			type: faker.helpers.arrayElement(['status', 'circumstance', 'item']),
			targetTags: 'attack or skill',
			value: faker.number.int(2147483647) + '',
		};
		modifiers.push(modifier);
	}
	return modifiers;
}

type CharacterTransientParams = {
	characterDataOptions: Partial<WG.CharacterApiResponse>;
};

class CharacterFactoryClass extends Factory<Character, CharacterTransientParams, Character> {
	withFakeId() {
		return this.params({
			id: faker.number.int(2147483647),
		});
	}
	withName(name) {
		return this.transient({
			characterDataOptions: {
				name,
			},
		});
	}
}

export const CharacterFactory = CharacterFactoryClass.define(({ onCreate, transientParams }) => {
	onCreate(async builtCharacter => Character.query().insert(builtCharacter));

	function createRandomAttributes(times: number): Character['attributes'] {
		const attributes = [];
		for (let i = 0; i < times; i++) {
			attributes.push({
				name: faker.word.noun(),
				type: faker.helpers.arrayElement(['base', 'ability', 'save', 'skill']),
				value: faker.number.int({ max: 30 }),
				tags: [
					faker.helpers.arrayElement(['ability', 'save', 'skill']),
					faker.helpers.arrayElement([
						'strength',
						'dexterity',
						'constitution',
						'intelligence',
						'wisdom',
						'charisma',
					]),
					faker.helpers.arrayElement([
						'fortitude',
						'reflex',
						'will',
						'athletics',
						'arcana',
						'nature',
						'perform',
						'nature',
						'lore',
						'medicine',
					]),
				],
			});
		}
		return attributes;
	}

	const characterDataOptions = transientParams.characterDataOptions;
	const name = faker.person.firstName();
	const characterData: DeepPartial<Character> = {
		name,
		trackerMode: faker.helpers.arrayElement(['counters_only', 'basic_stats', 'full_sheet']),
		charId: faker.number.int(2147483647),
		userId: faker.string.uuid(),
		attributes: [], //createRandomAttributes(faker.number.int({ max: 50 })),
		customAttributes: [], //createRandomAttributes(faker.number.int({ max: 50 })),
		modifiers: createRandomModifiers(faker.number.int({ max: 50 })),
		actions: [],
		customActions: [],
		rollMacros: [],
		calculatedStats: CalculatedStatsFactory.build(),
		characterData: CharacterDataFactory.build(characterDataOptions),
		isActiveCharacter: faker.datatype.boolean(),
		createdAt: faker.date.recent({ days: 30 }).toISOString(),
		lastUpdatedAt: faker.date.recent({ days: 30 }).toISOString(),
		sheet: {
			info: { traits: [], name },
			general: { senses: [], languages: [] },
			abilities: {},
			defenses: { resistances: [], immunities: [], weaknesses: [] },
			offense: {},
			castingStats: {},
			saves: {},
			skills: { lores: [] },
			attacks: [],
			rollMacros: [],
			actions: [],
			modifiers: [],
			sourceData: {},
		},
	};

	return Character.fromDatabaseJson(characterData);
});
