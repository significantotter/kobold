import { generateMock } from '@anatine/zod-mock';
import { truncateDbForTests, vitestKobold } from '../../../utils/discord-test-utils.js';
import {
	Character,
	SheetRecord,
	zChannelDefaultCharacterInitializer,
	zCharacterInitializer,
	zSheetRecordInitializer,
} from '../index.js';

describe('ChannelDefaultCharacterModel', () => {
	let fakeSheetRecord: SheetRecord;
	let fakeCharacter: Character;
	beforeEach(async () => {
		const fakeSheetRecordMock = generateMock(zSheetRecordInitializer);
		fakeSheetRecord = await vitestKobold.sheetRecord.create(fakeSheetRecordMock);
		const fakeCharacterMock = generateMock(zCharacterInitializer);
		fakeCharacterMock.sheetRecordId = fakeSheetRecord.id;
		fakeCharacter = await vitestKobold.character.create(fakeCharacterMock);
	});
	afterEach(async () => {
		await truncateDbForTests;
	});
	describe('create(), read()', () => {
		it('creates a new channel default character, reads it', async () => {
			const fakeChannelDefaultCharacter = generateMock(zChannelDefaultCharacterInitializer);
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
			const fakeChannelDefaultCharacter = generateMock(zChannelDefaultCharacterInitializer);
			fakeChannelDefaultCharacter.characterId = fakeCharacter.id;
			const fakeCharacter2Mock = generateMock(zCharacterInitializer);
			fakeCharacter2Mock.sheetRecordId = fakeSheetRecord.id;
			const fakeCharacter2 = await vitestKobold.character.create(fakeCharacter2Mock);
			const fakeChannelDefaultCharacter2 = generateMock(zChannelDefaultCharacterInitializer);
			fakeChannelDefaultCharacter2.characterId = fakeCharacter2.id;
			fakeChannelDefaultCharacter2.channelId = fakeChannelDefaultCharacter.channelId;
			fakeChannelDefaultCharacter2.userId = fakeChannelDefaultCharacter.userId;
			const created = await vitestKobold.channelDefaultCharacter.create(
				fakeChannelDefaultCharacter
			);
			expect(
				vitestKobold.channelDefaultCharacter.create(fakeChannelDefaultCharacter2)
			).rejects.toThrow(
				'duplicate key value violates unique constraint "channel_default_character_pkey'
			);
			const read = await vitestKobold.channelDefaultCharacter.read({
				userId: fakeChannelDefaultCharacter.userId,
				channelId: fakeChannelDefaultCharacter.channelId,
			});
			expect(created).toEqual(fakeChannelDefaultCharacter);
			expect(read).toEqual(fakeChannelDefaultCharacter);
		});
		it('fails to read a channel default character that does not exist', async () => {
			const fakeChannelDefaultCharacter = generateMock(zChannelDefaultCharacterInitializer);
			const read = await vitestKobold.channelDefaultCharacter.read({
				userId: fakeChannelDefaultCharacter.userId,
				channelId: fakeChannelDefaultCharacter.channelId,
			});
			expect(read).toEqual(null);
		});
	});
	describe('update', () => {
		it('updates a channel default character', async () => {
			const fakeChannelDefaultCharacter = generateMock(zChannelDefaultCharacterInitializer);
			fakeChannelDefaultCharacter.characterId = fakeCharacter.id;
			const created = await vitestKobold.channelDefaultCharacter.create(
				fakeChannelDefaultCharacter
			);
			const updated = await vitestKobold.channelDefaultCharacter.update(
				{
					userId: fakeChannelDefaultCharacter.userId,
					channelId: fakeChannelDefaultCharacter.channelId,
				},
				{
					characterId: fakeCharacter.id,
				}
			);
			expect(created).toEqual(fakeChannelDefaultCharacter);
			expect(updated).toEqual({
				...fakeChannelDefaultCharacter,
				characterId: fakeCharacter.id,
			});
		});
		it('fails to update a channel default character that does not exist', async () => {
			const fakeChannelDefaultCharacter = generateMock(zChannelDefaultCharacterInitializer);
			const updated = vitestKobold.channelDefaultCharacter.update(
				{
					userId: fakeChannelDefaultCharacter.userId,
					channelId: fakeChannelDefaultCharacter.channelId,
				},
				{
					characterId: fakeCharacter.id,
				}
			);
			expect(updated).rejects.toThrow('No rows updated');
		});
	});
	describe('delete', () => {
		it('deletes a channel default character', async () => {
			const fakeChannelDefaultCharacter = generateMock(zChannelDefaultCharacterInitializer);
			fakeChannelDefaultCharacter.characterId = fakeCharacter.id;
			await vitestKobold.channelDefaultCharacter.create(fakeChannelDefaultCharacter);
			await vitestKobold.channelDefaultCharacter.delete({
				userId: fakeChannelDefaultCharacter.userId,
				channelId: fakeChannelDefaultCharacter.channelId,
			});
			const read = await vitestKobold.channelDefaultCharacter.read({
				userId: fakeChannelDefaultCharacter.userId,
				channelId: fakeChannelDefaultCharacter.channelId,
			});
			expect(read).toEqual(null);
		});
		it('fails to delete a channel default character that does not exist', async () => {
			const fakeChannelDefaultCharacter = generateMock(zChannelDefaultCharacterInitializer);
			expect(
				vitestKobold.channelDefaultCharacter.delete({
					userId: fakeChannelDefaultCharacter.userId,
					channelId: fakeChannelDefaultCharacter.channelId,
				})
			).rejects.toThrow('No rows deleted');
		});
	});
});
