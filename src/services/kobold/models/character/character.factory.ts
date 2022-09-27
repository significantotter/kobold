import { CharacterDataFactory } from './../../../wanderers-guide/character-api/factories/characterData.factory';
import { CalculatedStatsFactory } from './../../../wanderers-guide/character-api/factories/calculatedStats.factory';
import { Factory } from 'fishery';
import type { DeepPartial } from 'fishery';
import { Character } from './character.model.js';
import { faker } from '@faker-js/faker';

type CharacterTransientParams = {};

class CharacterFactoryClass extends Factory<Character, CharacterTransientParams, Character> {
	withFakeId() {
		return this.params({
			id: faker.datatype.number(),
		});
	}
}

export const CharacterFactory = CharacterFactoryClass.define(({ onCreate }) => {
	onCreate(async builtCharacter => Character.query().insert(builtCharacter));

	const characterData: DeepPartial<Character> = {
		charId: faker.datatype.number(),
		userId: faker.datatype.uuid(),
		calculatedStats: CalculatedStatsFactory.build(),
		characterData: CharacterDataFactory.build(),
		isActiveCharacter: faker.datatype.boolean(),
		createdAt: faker.date.recent(30).toISOString(),
		lastUpdatedAt: faker.date.recent(30).toISOString(),
	};

	return Character.fromDatabaseJson(characterData);
});
