import { Factory } from 'fishery';
import type { DeepPartial } from 'fishery';
import { GameModel } from './game.model.js';
import { faker } from '@faker-js/faker';

type GameTransientParams = {};

class GameFactoryClass extends Factory<GameModel, GameTransientParams, GameModel> {
	withFakeId() {
		return this.params({
			id: faker.number.int(2147483647),
		});
	}
}

export const GameFactory = GameFactoryClass.define(({ onCreate }) => {
	onCreate(async builtGame => GameModel.query().insert(builtGame));

	const gameData: DeepPartial<GameModel> = {
		name: faker.word.noun(),
		guildId: faker.string.uuid(),
		gmUserId: faker.string.uuid(),
		isActive: Math.random() > 0.5,
	};

	return GameModel.fromDatabaseJson(gameData);
});
