import { Factory } from 'fishery';
import type { DeepPartial } from 'fishery';
import { CharacterModel } from './character.model.js';
import { faker } from '@faker-js/faker';
import { WG } from '../../../wanderers-guide/wanderers-guide.js';
import { Modifier, ModifierTypeEnum, SheetAdjustmentTypeEnum } from '../../schemas/index.js';
import { getDefaultSheet } from '../../lib/sheet-default.js';

export function createRandomModifiers(times: number): Modifier[] {
	const modifiers: Modifier[] = [];
	for (let i = 0; i < times; i++) {
		const modifier: Modifier = {
			name: faker.word.noun(),
			description: faker.word.words(5),
			isActive: faker.datatype.boolean(),
			type: faker.helpers.arrayElement(Object.values(SheetAdjustmentTypeEnum)),
			targetTags: 'attack or skill',
			value: faker.number.int(2147483647) + '',
			modifierType: ModifierTypeEnum.roll,
		};
		modifiers.push(modifier);
	}
	return modifiers;
}

type CharacterTransientParams = {
	characterDataOptions: Partial<WG.CharacterApiResponse>;
};

class CharacterFactoryClass extends Factory<
	CharacterModel,
	CharacterTransientParams,
	CharacterModel
> {
	withFakeId() {
		return this.params({
			id: faker.number.int(2147483647),
		});
	}
	withName(name: string) {
		return this.transient({
			characterDataOptions: {
				name,
			},
		});
	}
}

export const CharacterFactory = CharacterFactoryClass.define(({ onCreate }) => {
	onCreate(async builtCharacter => CharacterModel.query().insert(builtCharacter));

	const name = faker.person.firstName();
	const characterData: DeepPartial<CharacterModel> = {
		name,
		trackerMode: faker.helpers.arrayElement(['counters_only', 'basic_stats', 'full_sheet']),
		charId: faker.number.int(2147483647),
		userId: faker.string.uuid(),
		modifiers: createRandomModifiers(faker.number.int({ max: 50 })),
		actions: [],
		rollMacros: [],
		isActiveCharacter: faker.datatype.boolean(),
		createdAt: faker.date.recent({ days: 30 }).toISOString(),
		lastUpdatedAt: faker.date.recent({ days: 30 }).toISOString(),
		sheet: getDefaultSheet(),
	};

	return CharacterModel.fromDatabaseJson(characterData);
});
