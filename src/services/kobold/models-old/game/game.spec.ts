import { GameFactory } from './game.factory.js';
import { GameModel } from './game.model.js';
import { zGame } from '../../schemas/zod-tables/game.zod.js';

describe('Game', () => {
	test('validates a built factory', () => {
		const builtGame = GameFactory.build();
		const valid = zGame.safeParse(builtGame);
		expect(valid.success).toBe(true);
	});
	test('validates a created factory object', async () => {
		const createdGame = await GameFactory.create();
		const valid = zGame.safeParse(createdGame);
		expect(valid.success).toBe(true);
	});
	test('builds a factory with a fake id', async () => {
		const builtGame = GameFactory.withFakeId().build();
		expect(builtGame).toHaveProperty('id');
	});
	test('Model successfully inserts and retrieves a created factory', async () => {
		const builtGame = GameFactory.build();
		await GameModel.query().insert(builtGame);
		const fetchedGames = await GameModel.query();
		const insertedGame = fetchedGames.find(game => game.id === builtGame.id);
		expect(insertedGame?.id).toBe(builtGame.id);
	});
});
