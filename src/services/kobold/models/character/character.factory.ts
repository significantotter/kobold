import { CharacterDataFactory } from './../../../wanderers-guide/character-api/factories/characterData.factory';
import { CalculatedStatsFactory } from './../../../wanderers-guide/character-api/factories/calculatedStats.factory';
import { Factory } from 'fishery';
import type { DeepPartial } from 'fishery';
import { Character } from './character.model.js';
import { faker } from '@faker-js/faker';
import { WG } from '../../../wanderers-guide/wanderers-guide.js';

type CharacterTransientParams = {
	characterDataOptions: Partial<WG.CharacterApiResponse>;
};

class CharacterFactoryClass extends Factory<Character, CharacterTransientParams, Character> {
	withFakeId() {
		return this.params({
			id: faker.datatype.number(),
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
				name: faker.random.word(),
				type: faker.helpers.arrayElement(['base', 'ability', 'save', 'skill']),
				value: faker.datatype.number({ max: 30 }),
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
	const characterData: DeepPartial<Character> = {
		charId: faker.datatype.number(),
		userId: faker.datatype.uuid(),
		attributes: createRandomAttributes(faker.datatype.number({ max: 50 })),
		custom_attributes: createRandomAttributes(faker.datatype.number({ max: 50 })),
		modifiers: [],
		actions: [],
		custom_actions: [],
		calculatedStats: CalculatedStatsFactory.build(),
		characterData: CharacterDataFactory.build(characterDataOptions),
		isActiveCharacter: faker.datatype.boolean(),
		createdAt: faker.date.recent(30).toISOString(),
		lastUpdatedAt: faker.date.recent(30).toISOString(),
	};

	return Character.fromDatabaseJson(characterData);
});
