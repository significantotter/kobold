import { Factory } from 'fishery';
import type { DeepPartial } from 'fishery';
import { ChannelDefaultCharacterModel } from './channel-default-character.model.js';
import { faker } from '@faker-js/faker';

type ChannelDefaultCharacterTransientParams = {};

class ChannelDefaultCharacterFactoryClass extends Factory<
	ChannelDefaultCharacterModel,
	ChannelDefaultCharacterTransientParams,
	ChannelDefaultCharacterModel
> {}

export const ChannelDefaultCharacterFactory = ChannelDefaultCharacterFactoryClass.define(
	({ onCreate, transientParams }) => {
		onCreate(async builtChannelDefaultCharacter =>
			ChannelDefaultCharacterModel.query().insert(builtChannelDefaultCharacter)
		);

		const characterData: DeepPartial<ChannelDefaultCharacterModel> = {
			characterId: faker.number.int(2147483647),
			userId: faker.string.uuid(),
			channelId: faker.string.uuid(),
		};

		return ChannelDefaultCharacterModel.fromDatabaseJson(characterData);
	}
);
