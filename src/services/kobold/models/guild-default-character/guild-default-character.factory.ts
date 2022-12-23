import { Factory } from 'fishery';
import type { DeepPartial } from 'fishery';
import { GuildDefaultCharacter } from './guild-default-character.model.js';
import { faker } from '@faker-js/faker';

type GuildDefaultCharacterTransientParams = {};

class GuildDefaultCharacterFactoryClass extends Factory<
	GuildDefaultCharacter,
	GuildDefaultCharacterTransientParams,
	GuildDefaultCharacter
> {}

export const GuildDefaultCharacterFactory = GuildDefaultCharacterFactoryClass.define(
	({ onCreate, transientParams }) => {
		onCreate(async builtGuildDefaultCharacter =>
			GuildDefaultCharacter.query().insert(builtGuildDefaultCharacter)
		);

		const characterData: DeepPartial<GuildDefaultCharacter> = {
			characterId: faker.datatype.number(),
			userId: faker.datatype.uuid(),
			guildId: faker.datatype.uuid(),
		};

		return GuildDefaultCharacter.fromDatabaseJson(characterData);
	}
);
