import { Factory } from 'fishery';
import type { DeepPartial } from 'fishery';
import { Game } from './game.model.js';
import { faker } from '@faker-js/faker';

type GameTransientParams = {};

class GameFactoryClass extends Factory<Game, GameTransientParams, Game> {
	withFakeId() {
		return this.params({
			id: faker.datatype.number(),
		});
	}
}

export const GameFactory = GameFactoryClass.define(({ onCreate }) => {
	onCreate(async builtGame => Game.query().insert(builtGame));

	const gameData: DeepPartial<Game> = {
		name: faker.random.word(),
		guildId: faker.datatype.uuid(),
		gmUserId: faker.datatype.uuid(),
		isActive: Math.random() > 0.5,
	};

	return Game.fromDatabaseJson(gameData);
});
