import { generateMock } from '@anatine/zod-mock';
import { zCharactersInGamesInitializer } from '../index.js';
import { truncateDbForTests, ResourceFactories, vitestKobold } from '../test-utils.js';

describe('CharactersInGamesModel', () => {
	afterEach(async () => {
		await truncateDbForTests();
	});
	describe('create(), read()', () => {
		it('creates a new channel default character, reads it', async () => {
			const fakeCharacter = await ResourceFactories.character();
			const fakeGame = await ResourceFactories.game();
			const fakeCharactersInGames = generateMock(zCharactersInGamesInitializer);
			fakeCharactersInGames.characterId = fakeCharacter.id;
			fakeCharactersInGames.gameId = fakeGame.id;
			const created = await vitestKobold.charactersInGames.create(fakeCharactersInGames);
			const read = await vitestKobold.charactersInGames.read({
				gameId: fakeCharactersInGames.gameId,
				characterId: fakeCharactersInGames.characterId,
			});
			expect(created).toEqual(fakeCharactersInGames);
			expect(read).toEqual(fakeCharactersInGames);
		});
		it('fails to create a new channel default character if the user already has that character in the game', async () => {
			const fakeCharactersInGames = await ResourceFactories.charactersInGames();

			const fakeCharactersInGames2 = generateMock(zCharactersInGamesInitializer);
			fakeCharactersInGames2.gameId = fakeCharactersInGames.gameId;
			fakeCharactersInGames2.characterId = fakeCharactersInGames.characterId;

			expect(vitestKobold.charactersInGames.create(fakeCharactersInGames2)).rejects.toThrow(
				'duplicate key value violates unique constraint "characters_in_games_pkey"'
			);
			const read = await vitestKobold.charactersInGames.read({
				gameId: fakeCharactersInGames.gameId,
				characterId: fakeCharactersInGames.characterId,
			});
			expect(read).toEqual(fakeCharactersInGames);
		});
		it('fails to read a channel default character that does not exist', async () => {
			const fakeCharactersInGames = generateMock(zCharactersInGamesInitializer);
			const read = await vitestKobold.charactersInGames.read({
				gameId: fakeCharactersInGames.gameId,
				characterId: fakeCharactersInGames.characterId,
			});
			expect(read).toEqual(null);
		});
	});
	describe('update', () => {
		it('updates a channel default character', async () => {
			const fakeCharacter2 = await ResourceFactories.character();
			const charactersInGames = await ResourceFactories.charactersInGames();
			const updated = await vitestKobold.charactersInGames.update(
				{
					gameId: charactersInGames.gameId,
					characterId: charactersInGames.characterId,
				},
				{
					characterId: fakeCharacter2.id,
				}
			);
			expect(updated).toEqual({
				...charactersInGames,
				characterId: fakeCharacter2.id,
			});
		});
		it('fails to update a channel default character that does not exist', async () => {
			const fakeCharacter2 = await ResourceFactories.character();
			const fakeCharactersInGames = generateMock(zCharactersInGamesInitializer);
			const updated = vitestKobold.charactersInGames.update(
				{
					gameId: fakeCharactersInGames.gameId,
					characterId: fakeCharactersInGames.characterId,
				},
				{
					characterId: fakeCharacter2.id,
				}
			);
			expect(updated).rejects.toThrow('no result');
		});
	});
	describe('delete', () => {
		it('deletes a channel default character', async () => {
			const charactersInGames = await ResourceFactories.charactersInGames();
			await vitestKobold.charactersInGames.delete({
				gameId: charactersInGames.gameId,
				characterId: charactersInGames.characterId,
			});
			const read = await vitestKobold.charactersInGames.read({
				gameId: charactersInGames.gameId,
				characterId: charactersInGames.characterId,
			});
			expect(read).toEqual(null);
		});
		it('fails to delete a channel default character that does not exist', async () => {
			const fakeCharactersInGames = generateMock(zCharactersInGamesInitializer);
			expect(
				vitestKobold.charactersInGames.delete({
					gameId: fakeCharactersInGames.gameId,
					characterId: fakeCharactersInGames.characterId,
				})
			).rejects.toThrow('No rows deleted');
		});
	});
});
