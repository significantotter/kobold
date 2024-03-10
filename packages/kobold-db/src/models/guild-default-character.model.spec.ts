import { generateMock } from '@anatine/zod-mock';
import { zGuildDefaultCharacterInitializer } from '../index.js';
import { truncateDbForTests, ResourceFactories, vitestKobold } from '../test-utils.js';

describe('GuildDefaultCharacterModel', () => {
	afterEach(async () => {
		await truncateDbForTests();
	});
	describe('create(), read()', () => {
		it('creates a new guild default character, reads it', async () => {
			const fakeCharacter = await ResourceFactories.character();
			const fakeGuildDefaultCharacter = generateMock(zGuildDefaultCharacterInitializer);
			fakeGuildDefaultCharacter.characterId = fakeCharacter.id;
			const created =
				await vitestKobold.guildDefaultCharacter.create(fakeGuildDefaultCharacter);
			const read = await vitestKobold.guildDefaultCharacter.read({
				userId: fakeGuildDefaultCharacter.userId,
				guildId: fakeGuildDefaultCharacter.guildId,
			});
			expect(created).toEqual(fakeGuildDefaultCharacter);
			expect(read).toEqual(fakeGuildDefaultCharacter);
		});
		it('fails to create a new guild default character if the user already has a default character for the guild', async () => {
			const fakeCharacter = await ResourceFactories.character();
			const fakeGuildDefaultCharacter = await ResourceFactories.guildDefaultCharacter({
				characterId: fakeCharacter.id,
			});
			const fakeCharacter2 = await ResourceFactories.character();

			const fakeGuildDefaultCharacter2 = generateMock(zGuildDefaultCharacterInitializer);
			fakeGuildDefaultCharacter2.characterId = fakeCharacter2.id;
			fakeGuildDefaultCharacter2.guildId = fakeGuildDefaultCharacter.guildId;
			fakeGuildDefaultCharacter2.userId = fakeGuildDefaultCharacter.userId;

			expect(
				vitestKobold.guildDefaultCharacter.create(fakeGuildDefaultCharacter2)
			).rejects.toThrow(
				'duplicate key value violates unique constraint "guild_default_character_pkey'
			);
			const read = await vitestKobold.guildDefaultCharacter.read({
				userId: fakeGuildDefaultCharacter.userId,
				guildId: fakeGuildDefaultCharacter.guildId,
			});
			expect(read).toEqual(fakeGuildDefaultCharacter);
		});
		it('fails to read a guild default character that does not exist', async () => {
			const fakeGuildDefaultCharacter = generateMock(zGuildDefaultCharacterInitializer);
			const read = await vitestKobold.guildDefaultCharacter.read({
				userId: fakeGuildDefaultCharacter.userId,
				guildId: fakeGuildDefaultCharacter.guildId,
			});
			expect(read).toEqual(null);
		});
	});
	describe('update', () => {
		it('updates a guild default character', async () => {
			const fakeCharacter = await ResourceFactories.character();
			const guildDefaultCharacter = await ResourceFactories.guildDefaultCharacter();
			const updated = await vitestKobold.guildDefaultCharacter.update(
				{
					userId: guildDefaultCharacter.userId,
					guildId: guildDefaultCharacter.guildId,
				},
				{
					characterId: fakeCharacter.id,
				}
			);
			expect(updated).toEqual({
				...guildDefaultCharacter,
				characterId: fakeCharacter.id,
			});
		});
		it('fails to update a guild default character that does not exist', async () => {
			const fakeCharacter = await ResourceFactories.character();
			const fakeGuildDefaultCharacter = generateMock(zGuildDefaultCharacterInitializer);
			const updated = vitestKobold.guildDefaultCharacter.update(
				{
					userId: fakeGuildDefaultCharacter.userId,
					guildId: fakeGuildDefaultCharacter.guildId,
				},
				{
					characterId: fakeCharacter.id,
				}
			);
			expect(updated).rejects.toThrow('no result');
		});
	});
	describe('delete', () => {
		it('deletes a guild default character', async () => {
			const guildDefaultCharacter = await ResourceFactories.guildDefaultCharacter();
			await vitestKobold.guildDefaultCharacter.delete({
				userId: guildDefaultCharacter.userId,
				guildId: guildDefaultCharacter.guildId,
			});
			const read = await vitestKobold.guildDefaultCharacter.read({
				userId: guildDefaultCharacter.userId,
				guildId: guildDefaultCharacter.guildId,
			});
			expect(read).toEqual(null);
		});
		it('fails to delete a guild default character that does not exist', async () => {
			const fakeGuildDefaultCharacter = generateMock(zGuildDefaultCharacterInitializer);
			expect(
				vitestKobold.guildDefaultCharacter.delete({
					userId: fakeGuildDefaultCharacter.userId,
					guildId: fakeGuildDefaultCharacter.guildId,
				})
			).rejects.toThrow('No rows deleted');
		});
	});
	describe('deleteIfExists', () => {
		it('deletes a guild default character', async () => {
			const guildDefaultCharacter = await ResourceFactories.guildDefaultCharacter();
			await vitestKobold.guildDefaultCharacter.deleteIfExists({
				userId: guildDefaultCharacter.userId,
				guildId: guildDefaultCharacter.guildId,
			});
			const read = await vitestKobold.guildDefaultCharacter.read({
				userId: guildDefaultCharacter.userId,
				guildId: guildDefaultCharacter.guildId,
			});
			expect(read).toEqual(null);
		});
		it('fails silently when deleting a guild default character that does not exist', async () => {
			const fakeGuildDefaultCharacter = generateMock(zGuildDefaultCharacterInitializer);
			expect(
				vitestKobold.guildDefaultCharacter.deleteIfExists({
					userId: fakeGuildDefaultCharacter.userId,
					guildId: fakeGuildDefaultCharacter.guildId,
				})
			).resolves.toBeUndefined();
		});
	});
});
