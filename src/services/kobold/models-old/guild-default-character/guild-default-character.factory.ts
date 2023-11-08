import { Factory } from 'fishery';
import type { DeepPartial } from 'fishery';
import { GuildDefaultCharacterModel } from './guild-default-character.model.js';
import { faker } from '@faker-js/faker';

type GuildDefaultCharacterTransientParams = {};

class GuildDefaultCharacterFactoryClass extends Factory<
	GuildDefaultCharacterModel,
	GuildDefaultCharacterTransientParams,
	GuildDefaultCharacterModel
> {}

export const GuildDefaultCharacterFactory = GuildDefaultCharacterFactoryClass.define(
	({ onCreate, transientParams }) => {
		onCreate(async builtGuildDefaultCharacter =>
			GuildDefaultCharacterModel.query().insert(builtGuildDefaultCharacter)
		);

		const characterData: DeepPartial<GuildDefaultCharacterModel> = {
			characterId: faker.number.int(2147483647),
			userId: faker.string.uuid(),
			guildId: faker.string.uuid(),
		};

		return GuildDefaultCharacterModel.fromDatabaseJson(characterData);
	}
);
