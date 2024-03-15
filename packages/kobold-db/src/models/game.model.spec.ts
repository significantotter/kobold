import { generateMock } from '@anatine/zod-mock';
import { zGameInitializer } from '../index.js';
import _ from 'lodash';
import { truncateDbForTests, vitestKobold, ResourceFactories } from '../test-utils.js';

describe('GameModel', () => {
	afterEach(async () => {
		await truncateDbForTests();
	});
	describe('create, read', () => {
		it('creates a new game, reads it, and returns the game plus relations', async () => {
			const fakeGameMock = generateMock(zGameInitializer);

			const created = await vitestKobold.game.create(fakeGameMock);
			const read = await vitestKobold.game.read({ id: created.id });
			expect(created).toMatchObject(fakeGameMock);
			expect(read).toMatchObject(fakeGameMock);
		});

		it('reads the relations of the game', async () => {
			const fakeGame = await ResourceFactories.game();
			const [fakeCharacter, fakeCharacter2] = await Promise.all([
				ResourceFactories.character(),
				ResourceFactories.character(),
			]);

			const read = await vitestKobold.game.read({ id: fakeGame.id });
			expect(read).toMatchObject({
				...fakeGame,
				characters: [
					_.omit(fakeCharacter, 'createdAt', 'lastUpdatedAt'),
					_.omit(fakeCharacter2, 'createdAt', 'lastUpdatedAt'),
				],
			});
		});
	});
	describe('update', () => {
		it('updates a game', async () => {
			const fakeGame = await ResourceFactories.game();
			const updated = await vitestKobold.game.update(
				{ id: fakeGame.id },
				{ name: 'new name' }
			);
			expect(updated).toEqual({
				...fakeGame,
				name: 'new name',
			});
		});
		it('fails to update a game if the game id is invalid', async () => {
			await expect(
				vitestKobold.game.update({ id: -1 }, { name: 'new name' })
			).rejects.toThrow();
		});
	});
	describe('delete', () => {
		it('deletes a game', async () => {
			const fakeGame = await ResourceFactories.game();
			await vitestKobold.game.delete({ id: fakeGame.id });
			const read = await vitestKobold.game.read({ id: fakeGame.id });
			expect(read).toEqual(null);
		});
		it('fails to delete a game if the game does not exist', async () => {
			await expect(vitestKobold.game.delete({ id: -1 })).rejects.toThrow();
		});
	});
	describe('readMany', () => {
		it('reads all games that match a guildId, a gmUserId, a name, or a combination', async () => {
			const fakeSheetRecord = await ResourceFactories.sheetRecord();
			const [game1, game2, game3] = await Promise.all([
				ResourceFactories.game({
					guildId: 'foo',
					gmUserId: 'foo',
					name: 'bar',
				}),
				ResourceFactories.game({
					guildId: 'foo',
					gmUserId: 'bar',
					name: 'foo',
				}),
				ResourceFactories.game({
					guildId: 'bar',
					gmUserId: 'foo',
					name: 'foo',
				}),
			]);
			const read = await vitestKobold.game.readMany({ guildId: 'foo' });
			expect(read).toContainEqual(game1);
			expect(read).toContainEqual(game2);
			expect(read).not.toContainEqual(game3);

			const read2 = await vitestKobold.game.readMany({
				gmUserId: 'foo',
			});
			expect(read2).toContainEqual(game1);
			expect(read2).toContainEqual(game3);
			expect(read2).not.toContainEqual(game2);

			const read3 = await vitestKobold.game.readMany({
				name: 'foo',
			});
			expect(read3).toContainEqual(game2);
			expect(read3).toContainEqual(game3);
			expect(read3).not.toContainEqual(game1);

			const read4 = await vitestKobold.game.readMany({
				guildId: 'foo',
				gmUserId: 'foo',
			});
			expect(read4.sort()).toEqual([game1].sort());

			const read5 = await vitestKobold.game.readMany({
				guildId: 'foo',
				name: 'foo',
			});
			expect(read5).toEqual([game2]);

			const read6 = await vitestKobold.game.readMany({
				name: 'foo',
				gmUserId: 'foo',
			});
			expect(read6).toEqual([game3]);
		});
	});
});
