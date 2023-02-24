import Ajv from 'ajv';
import { GameFactory } from './game.factory.js';
import { Game } from './game.model.js';
import GameSchema from './game.schema.json';
import addFormats from 'ajv-formats';
const ajv = new Ajv({ allowUnionTypes: true });
addFormats(ajv);

describe('Game', () => {
	test('validates a built factory', () => {
		const builtGame = GameFactory.build();
		const valid = ajv.validate(GameSchema, builtGame);
		expect(valid).toBe(true);
	});
	test('validates a created factory object', async () => {
		const createdGame = await GameFactory.create();
		const valid = ajv.validate(GameSchema, createdGame);
		expect(valid).toBe(true);
	});
	test('builds a factory with a fake id', async () => {
		const builtGame = GameFactory.withFakeId().build();
		expect(builtGame).toHaveProperty('id');
	});
	test('Model successfully inserts and retrieves a created factory', async () => {
		const builtGame = GameFactory.build();
		await Game.query().insert(builtGame);
		const fetchedGames = await Game.query();
		const insertedGame = fetchedGames.find(factory => factory.charId === builtGame.charId);
		expect(insertedGame.charId).toBe(builtGame.charId);
	});
});
