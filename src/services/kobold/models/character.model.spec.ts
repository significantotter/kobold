import { generateMock } from '@anatine/zod-mock';
import { truncateDbForTests, vitestKobold } from '../../../utils/discord-test-utils.js';
import {
	Character,
	SheetRecord,
	zChannelDefaultCharacterInitializer,
	zCharacterInitializer,
	zGuildDefaultCharacterInitializer,
	zSheetRecordInitializer,
} from '../index.js';

describe('CharacterModel', () => {
	let fakeSheetRecord: SheetRecord;

	beforeEach(async () => {
		const fakeSheetRecordMock = generateMock(zSheetRecordInitializer);
		fakeSheetRecord = await vitestKobold.sheetRecord.create(fakeSheetRecordMock);
	});
	afterEach(async () => {
		await truncateDbForTests;
	});

	describe('create, read', () => {
		it('creates a new character, reads it, and returns the character plus relations', async () => {
			const fakeCharacterMock = generateMock(zCharacterInitializer);
			fakeCharacterMock.sheetRecordId = fakeSheetRecord.id;
			const fakeCharacterMockWithRelations = {
				...fakeCharacterMock,
				sheetRecord: fakeSheetRecord,
				guildDefaultCharacters: [],
				channelDefaultCharacters: [],
			};
			const created = await vitestKobold.character.create(fakeCharacterMock);
			const read = await vitestKobold.character.read({ id: created.id });
			expect(created).toEqual(fakeCharacterMockWithRelations);
			expect(read).toEqual(fakeCharacterMockWithRelations);
		});

		it('fails to create a new character if an invalid sheetRecordId is already used', async () => {
			const fakeCharacterMock = generateMock(zCharacterInitializer);
			fakeCharacterMock.sheetRecordId = -1;
			await expect(vitestKobold.character.create(fakeCharacterMock)).rejects.toThrow();
		});

		it('reads the relations of the character', async () => {
			const fakeCharacterMock = generateMock(zCharacterInitializer);
			fakeCharacterMock.sheetRecordId = fakeSheetRecord.id;
			const created = await vitestKobold.character.create(fakeCharacterMock);
			const guildDefaultCharacterMock = generateMock(zGuildDefaultCharacterInitializer);
			guildDefaultCharacterMock.characterId = created.id;
			const guildDefaultCharacter =
				await vitestKobold.guildDefaultCharacter.create(guildDefaultCharacterMock);
			const channelDefaultCharacterMock = generateMock(zChannelDefaultCharacterInitializer);
			channelDefaultCharacterMock.characterId = created.id;
			const channelDefaultCharacter = await vitestKobold.channelDefaultCharacter.create(
				channelDefaultCharacterMock
			);
			const read = await vitestKobold.character.read({ id: created.id });
			expect(read).toEqual({
				...created,
				guildDefaultCharacters: [guildDefaultCharacter],
				channelDefaultCharacters: [channelDefaultCharacter],
				sheetRecord: fakeSheetRecord,
			});
		});
	});
	describe('update', () => {
		it('updates a character', async () => {
			const fakeCharacterMock = generateMock(zCharacterInitializer);
			fakeCharacterMock.sheetRecordId = fakeSheetRecord.id;
			const created = await vitestKobold.character.create(fakeCharacterMock);
			const updated = await vitestKobold.character.update(
				{ id: created.id },
				{ name: 'new name' }
			);
			expect(updated).toEqual({
				...created,
				name: 'new name',
			});
		});
		it('fails to update a character if the sheetRecordId is invalid', async () => {
			const fakeCharacterMock = generateMock(zCharacterInitializer);
			fakeCharacterMock.sheetRecordId = fakeSheetRecord.id;
			const created = await vitestKobold.character.create(fakeCharacterMock);
			await expect(
				vitestKobold.character.update({ id: created.id }, { sheetRecordId: -1 })
			).rejects.toThrow();
		});
	});
	describe('delete', () => {
		it('deletes a character', async () => {
			const fakeCharacterMock = generateMock(zCharacterInitializer);
			fakeCharacterMock.sheetRecordId = fakeSheetRecord.id;
			const created = await vitestKobold.character.create(fakeCharacterMock);
			await vitestKobold.character.delete({ id: created.id });
			const read = await vitestKobold.character.read({ id: created.id });
			expect(read).toEqual(null);
		});
		it('fails to delete a character if the character does not exist', async () => {
			await expect(vitestKobold.character.delete({ id: -1 })).rejects.toThrow();
		});
	});
	describe('setIsActive, readActive', () => {
		it('sets the active character for a user', async () => {
			const fakeCharacterMock = generateMock(zCharacterInitializer);
			fakeCharacterMock.sheetRecordId = fakeSheetRecord.id;
			const created = await vitestKobold.character.create(fakeCharacterMock);
			const createdWithRelations = {
				...created,
				sheetRecord: fakeSheetRecord,
				guildDefaultCharacters: [],
				channelDefaultCharacters: [],
			};
			await vitestKobold.character.setIsActive({ id: created.id, userId: created.userId });
			const read = await vitestKobold.character.readActive({ userId: created.userId });
			expect(read?.isActiveCharacter).toEqual(true);
		});
		it('unsets any existing active character for a user, but not any other user', async () => {
			const fakeCharacterMock = generateMock(zCharacterInitializer);
			const fakeCharacterMock2 = generateMock(zCharacterInitializer);
			const fakeCharacterMock3 = generateMock(zCharacterInitializer);
			fakeCharacterMock.sheetRecordId = fakeSheetRecord.id;
			fakeCharacterMock2.sheetRecordId = fakeSheetRecord.id;
			fakeCharacterMock2.isActiveCharacter = true;
			fakeCharacterMock2.userId = fakeCharacterMock.userId;
			fakeCharacterMock3.sheetRecordId = fakeSheetRecord.id;
			fakeCharacterMock3.isActiveCharacter = true;
			const [character1, character2, character3] = await Promise.all([
				vitestKobold.character.create(fakeCharacterMock),
				vitestKobold.character.create(fakeCharacterMock2),
				vitestKobold.character.create(fakeCharacterMock3),
			]);
			await vitestKobold.character.setIsActive({
				id: character1.id,
				userId: character1.userId,
			});
			const [updatedCharacter1, updatedCharacter2, updatedCharacter3] = await Promise.all([
				vitestKobold.character.read({ id: character1.id }),
				vitestKobold.character.read({ id: character2.id }),
				vitestKobold.character.read({ id: character3.id }),
			]);

			expect(updatedCharacter1?.isActiveCharacter).toEqual(true);
			expect(updatedCharacter2?.isActiveCharacter).toEqual(false);
			expect(updatedCharacter3?.isActiveCharacter).toEqual(true);
		});
	});
	describe('readMany', () => {
		it('reads many characters', async () => {
			const fakeCharacterMock = generateMock(zCharacterInitializer);
			fakeCharacterMock.sheetRecordId = fakeSheetRecord.id;
			const fakeCharacterMock2 = generateMock(zCharacterInitializer);
			fakeCharacterMock2.sheetRecordId = fakeSheetRecord.id;
			fakeCharacterMock2.name = fakeCharacterMock.name;
			const fakeCharacterMock3 = generateMock(zCharacterInitializer);
			fakeCharacterMock3.sheetRecordId = fakeSheetRecord.id;
			fakeCharacterMock3.userId = fakeCharacterMock.userId;

			const [character1, character2, character3] = await Promise.all([
				vitestKobold.character.create(fakeCharacterMock),
				vitestKobold.character.create(fakeCharacterMock2),
				vitestKobold.character.create(fakeCharacterMock3),
			]);

			const read = await vitestKobold.character.readMany({ name: fakeCharacterMock.name });
			expect(read).toContainEqual(character1);
			expect(read).toContainEqual(character2);
			expect(read).not.toContainEqual(character3);
			const read2 = await vitestKobold.character.readMany({
				userId: fakeCharacterMock.userId,
			});
			expect(read2).toContainEqual(character1);
			expect(read2).toContainEqual(character3);
			expect(read2).not.toContainEqual(character2);
		});
	});
});
