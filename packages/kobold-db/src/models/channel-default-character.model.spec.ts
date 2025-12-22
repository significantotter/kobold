
import {
	Character,
	SheetRecord,
	zChannelDefaultCharacterInitializer,
	zCharacterInitializer,
	zSheetRecordInitializer,
} from '../index.js';
import { truncateDbForTests, ResourceFactories, vitestKobold, fake } from '../test-utils.js';

describe('ChannelDefaultCharacterModel', () => {
	afterEach(async () => {
		await truncateDbForTests();
	});
	describe('create(), read()', () => {
		it('creates a new channel default character, reads it', async () => {
			const fakeCharacter = await ResourceFactories.character();
			const fakeChannelDefaultCharacter = fake(zChannelDefaultCharacterInitializer);
			fakeChannelDefaultCharacter.characterId = fakeCharacter.id;
			const created = await vitestKobold.channelDefaultCharacter.create(
				fakeChannelDefaultCharacter
			);
			const read = await vitestKobold.channelDefaultCharacter.read({
				userId: fakeChannelDefaultCharacter.userId,
				channelId: fakeChannelDefaultCharacter.channelId,
			});
			expect(created).toEqual(fakeChannelDefaultCharacter);
			expect(read).toEqual(fakeChannelDefaultCharacter);
		});
		it('fails to create a new channel default character if the user already has a default character for the channel', async () => {
			const fakeCharacter = await ResourceFactories.character();
			const fakeChannelDefaultCharacter = await ResourceFactories.channelDefaultCharacter({
				characterId: fakeCharacter.id,
			});
			const fakeCharacter2 = await ResourceFactories.character();

			const fakeChannelDefaultCharacter2 = fake(zChannelDefaultCharacterInitializer);
			fakeChannelDefaultCharacter2.characterId = fakeCharacter2.id;
			fakeChannelDefaultCharacter2.channelId = fakeChannelDefaultCharacter.channelId;
			fakeChannelDefaultCharacter2.userId = fakeChannelDefaultCharacter.userId;

			expect(
				vitestKobold.channelDefaultCharacter.create(fakeChannelDefaultCharacter2)
			).rejects.toThrow(
				'duplicate key value violates unique constraint "channel_default_character_pkey'
			);
			const read = await vitestKobold.channelDefaultCharacter.read({
				userId: fakeChannelDefaultCharacter.userId,
				channelId: fakeChannelDefaultCharacter.channelId,
			});
			expect(read).toEqual(fakeChannelDefaultCharacter);
		});
		it('fails to read a channel default character that does not exist', async () => {
			const fakeChannelDefaultCharacter = fake(zChannelDefaultCharacterInitializer);
			const read = await vitestKobold.channelDefaultCharacter.read({
				userId: fakeChannelDefaultCharacter.userId,
				channelId: fakeChannelDefaultCharacter.channelId,
			});
			expect(read).toEqual(null);
		});
	});
	describe('update', () => {
		it('updates a channel default character', async () => {
			const fakeCharacter = await ResourceFactories.character();
			const channelDefaultCharacter = await ResourceFactories.channelDefaultCharacter();
			const updated = await vitestKobold.channelDefaultCharacter.update(
				{
					userId: channelDefaultCharacter.userId,
					channelId: channelDefaultCharacter.channelId,
				},
				{
					characterId: fakeCharacter.id,
				}
			);
			expect(updated).toEqual({
				...channelDefaultCharacter,
				characterId: fakeCharacter.id,
			});
		});
		it('fails to update a channel default character that does not exist', async () => {
			const fakeCharacter = await ResourceFactories.character();
			const fakeChannelDefaultCharacter = fake(zChannelDefaultCharacterInitializer);
			const updated = vitestKobold.channelDefaultCharacter.update(
				{
					userId: fakeChannelDefaultCharacter.userId,
					channelId: fakeChannelDefaultCharacter.channelId,
				},
				{
					characterId: fakeCharacter.id,
				}
			);
			expect(updated).rejects.toThrow('no result');
		});
	});
	describe('delete', () => {
		it('deletes a channel default character', async () => {
			const channelDefaultCharacter = await ResourceFactories.channelDefaultCharacter();
			await vitestKobold.channelDefaultCharacter.delete({
				userId: channelDefaultCharacter.userId,
				channelId: channelDefaultCharacter.channelId,
			});
			const read = await vitestKobold.channelDefaultCharacter.read({
				userId: channelDefaultCharacter.userId,
				channelId: channelDefaultCharacter.channelId,
			});
			expect(read).toEqual(null);
		});
		it('fails to delete a channel default character that does not exist', async () => {
			const fakeChannelDefaultCharacter = fake(zChannelDefaultCharacterInitializer);
			expect(
				vitestKobold.channelDefaultCharacter.delete({
					userId: fakeChannelDefaultCharacter.userId,
					channelId: fakeChannelDefaultCharacter.channelId,
				})
			).rejects.toThrow('No rows deleted');
		});
	});
	describe('deleteIfExists', () => {
		it('deletes a channel default character', async () => {
			const channelDefaultCharacter = await ResourceFactories.channelDefaultCharacter();
			await vitestKobold.channelDefaultCharacter.deleteIfExists({
				userId: channelDefaultCharacter.userId,
				channelId: channelDefaultCharacter.channelId,
			});
			const read = await vitestKobold.channelDefaultCharacter.read({
				userId: channelDefaultCharacter.userId,
				channelId: channelDefaultCharacter.channelId,
			});
			expect(read).toEqual(null);
		});
		it('fails silently when deleting a channel default character that does not exist', async () => {
			const fakeChannelDefaultCharacter = fake(zChannelDefaultCharacterInitializer);
			expect(
				vitestKobold.channelDefaultCharacter.deleteIfExists({
					userId: fakeChannelDefaultCharacter.userId,
					channelId: fakeChannelDefaultCharacter.channelId,
				})
			).resolves.toBeUndefined();
		});
	});
});
