import { generateMock } from '@anatine/zod-mock';
import {
	ResourceFactories,
	truncateDbForTests,
	vitestKobold,
} from '../../../utils/discord-test-utils.js';
import { zCharacterInitializer } from '../index.js';

describe('CharacterModel', () => {
	afterEach(async () => {
		await truncateDbForTests;
	});
	describe('create, read', () => {
		it('creates a new character, reads it, and returns the character plus relations', async () => {
			const fakeSheetRecord = await ResourceFactories.sheetRecord();
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
			const fakeSheetRecord = await ResourceFactories.sheetRecord();
			const fakeCharacter = await ResourceFactories.character({
				sheetRecordId: fakeSheetRecord.id,
			});
			const guildDefaultCharacter = await ResourceFactories.guildDefaultCharacter({
				characterId: fakeCharacter.id,
			});
			const channelDefaultCharacter = await ResourceFactories.channelDefaultCharacter({
				characterId: fakeCharacter.id,
			});

			const read = await vitestKobold.character.read({ id: fakeCharacter.id });
			expect(read).toEqual({
				...fakeCharacter,
				guildDefaultCharacters: [guildDefaultCharacter],
				channelDefaultCharacters: [channelDefaultCharacter],
				sheetRecord: fakeSheetRecord,
			});
		});
	});
	describe('update', () => {
		it('updates a character', async () => {
			const fakeCharacter = await ResourceFactories.character();
			const updated = await vitestKobold.character.update(
				{ id: fakeCharacter.id },
				{ name: 'new name' }
			);
			expect(updated).toEqual({
				...fakeCharacter,
				name: 'new name',
			});
		});
		it('fails to update a character if the sheetRecordId is invalid', async () => {
			const fakeCharacter = await ResourceFactories.character();
			await expect(
				vitestKobold.character.update({ id: fakeCharacter.id }, { sheetRecordId: -1 })
			).rejects.toThrow();
		});
	});
	describe('delete', () => {
		it('deletes a character', async () => {
			const fakeCharacter = await ResourceFactories.character();
			await vitestKobold.character.delete({ id: fakeCharacter.id });
			const read = await vitestKobold.character.read({ id: fakeCharacter.id });
			expect(read).toEqual(null);
		});
		it('fails to delete a character if the character does not exist', async () => {
			await expect(vitestKobold.character.delete({ id: -1 })).rejects.toThrow();
		});
	});
	describe('setIsActive, readActive', () => {
		it('sets the active character for a user', async () => {
			const fakeSheetRecord = await ResourceFactories.sheetRecord();
			const fakeCharacter = await ResourceFactories.character({
				sheetRecordId: fakeSheetRecord.id,
			});
			const createdWithRelations = {
				...fakeCharacter,
				sheetRecord: fakeSheetRecord,
				guildDefaultCharacters: [],
				channelDefaultCharacters: [],
			};
			await vitestKobold.character.setIsActive({
				id: fakeCharacter.id,
				userId: fakeCharacter.userId,
			});
			const read = await vitestKobold.character.readActive({ userId: fakeCharacter.userId });
			expect(read?.isActiveCharacter).toEqual(true);
		});
		it('unsets any existing active character for a user, but not any other user', async () => {
			const fakeSheetRecord = await ResourceFactories.sheetRecord();
			const [character1, character2, character3] = await Promise.all([
				ResourceFactories.character({
					sheetRecordId: fakeSheetRecord.id,
					isActiveCharacter: false,
					userId: 'foo',
				}),
				ResourceFactories.character({
					sheetRecordId: fakeSheetRecord.id,
					isActiveCharacter: true,
					userId: 'foo',
				}),
				ResourceFactories.character({
					sheetRecordId: fakeSheetRecord.id,
					isActiveCharacter: true,
					userId: 'bar',
				}),
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
			const fakeSheetRecord = await ResourceFactories.sheetRecord();
			const [character1, character2, character3] = await Promise.all([
				ResourceFactories.character({
					sheetRecordId: fakeSheetRecord.id,
					isActiveCharacter: false,
					userId: 'foo',
					name: 'foo',
				}),
				ResourceFactories.character({
					sheetRecordId: fakeSheetRecord.id,
					isActiveCharacter: true,
					userId: 'bar',
					name: 'foo',
				}),
				ResourceFactories.character({
					sheetRecordId: fakeSheetRecord.id,
					isActiveCharacter: true,
					userId: 'foo',
					name: 'bar',
				}),
			]);

			const read = await vitestKobold.character.readMany({ name: 'foo' });
			expect(read).toContainEqual(character1);
			expect(read).toContainEqual(character2);
			expect(read).not.toContainEqual(character3);
			const read2 = await vitestKobold.character.readMany({
				userId: 'foo',
			});
			expect(read2).toContainEqual(character1);
			expect(read2).toContainEqual(character3);
			expect(read2).not.toContainEqual(character2);
		});
	});
});
