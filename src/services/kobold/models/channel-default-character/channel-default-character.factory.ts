import { Factory } from 'fishery';
import type { DeepPartial } from 'fishery';
import { ChannelDefaultCharacter } from './channel-default-character.model.js';
import { faker } from '@faker-js/faker';

type ChannelDefaultCharacterTransientParams = {};

class ChannelDefaultCharacterFactoryClass extends Factory<
	ChannelDefaultCharacter,
	ChannelDefaultCharacterTransientParams,
	ChannelDefaultCharacter
> {}

export const ChannelDefaultCharacterFactory = ChannelDefaultCharacterFactoryClass.define(
	({ onCreate, transientParams }) => {
		onCreate(async builtChannelDefaultCharacter =>
			ChannelDefaultCharacter.query().insert(builtChannelDefaultCharacter)
		);

		const characterData: DeepPartial<ChannelDefaultCharacter> = {
			characterId: faker.number.int(2147483647),
			userId: faker.string.uuid(),
			channelId: faker.string.uuid(),
		};

		return ChannelDefaultCharacter.fromDatabaseJson(characterData);
	}
);
