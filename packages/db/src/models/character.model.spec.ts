import { zNewCharacter } from '../index.js';
import {
	truncateDbForTests,
	ResourceFactories,
	vitestKobold,
	fake,
	safeInt,
} from '../test-utils.js';
import _ from 'lodash';

describe('CharacterModel', () => {
	afterEach(async () => {
		await truncateDbForTests();
	});
	describe('create, read', () => {
		it('creates a new character and reads it back with relations', async () => {
			const fakeSheetRecord = await ResourceFactories.sheetRecord();
			const fakeGame = await ResourceFactories.game();
			const fakeCharacterMock = fake(zNewCharacter);
			fakeCharacterMock.sheetRecordId = fakeSheetRecord.id;
			fakeCharacterMock.gameId = fakeGame.id;
			fakeCharacterMock.charId = safeInt();
			delete fakeCharacterMock.id;
			delete fakeCharacterMock.createdAt;
			delete fakeCharacterMock.lastUpdatedAt;
			delete fakeCharacterMock.isActiveCharacter;
			const fakeCharacterMockWithRelations = {
				...fakeCharacterMock,
				game: _.omit(fakeGame, 'createdAt', 'lastUpdatedAt', 'characters'),
				sheetRecord: _.omit(fakeSheetRecord, 'adjustedSheet'),
				guildDefaultCharacters: [],
				channelDefaultCharacters: [],
			};
			const { id } = await vitestKobold.character.createReturningId(fakeCharacterMock);
			expect(id).toEqual(expect.any(Number));
			const read = await vitestKobold.character.read({ id });
			expect(read).toMatchObject(fakeCharacterMockWithRelations);
		});
		it('creates a new character with no relations', async () => {
			const fakeSheetRecord = await ResourceFactories.sheetRecord();
			let fakeCharacterMock = fake(zNewCharacter);
			fakeCharacterMock.sheetRecordId = fakeSheetRecord.id;
			fakeCharacterMock.charId = safeInt();
			delete fakeCharacterMock.gameId;
			delete fakeCharacterMock.id;
			delete fakeCharacterMock.createdAt;
			delete fakeCharacterMock.lastUpdatedAt;
			delete fakeCharacterMock.isActiveCharacter;

			const fakeCharacterMockWithRelations = {
				...fakeCharacterMock,
				game: null,
				gameId: null,
				sheetRecord: _.omit(fakeSheetRecord, 'adjustedSheet'),
				guildDefaultCharacters: [],
				channelDefaultCharacters: [],
			};
			const { id } = await vitestKobold.character.createReturningId(fakeCharacterMock);
			const read = await vitestKobold.character.read({ id });
			expect(read).toMatchObject(fakeCharacterMockWithRelations);
		});

		it('fails to create a new character if an invalid sheetRecordId is already used', async () => {
			const fakeCharacterMock = fake(zNewCharacter);
			fakeCharacterMock.sheetRecordId = -1;
			fakeCharacterMock.charId = safeInt();
			await expect(
				vitestKobold.character.createReturningId(fakeCharacterMock)
			).rejects.toThrow();
		});

		it('reads the relations of the character', async () => {
			const fakeSheetRecord = await ResourceFactories.sheetRecord();
			const fakeCharacter = await ResourceFactories.character({
				sheetRecordId: fakeSheetRecord.id,
			});

			const read = await vitestKobold.character.read({ id: fakeCharacter.id });
			// read({id}) does not load guild/channel defaults (requires guildId/channelId context)
			expect(read).toMatchObject({
				..._.omit(fakeCharacter, 'createdAt', 'lastUpdatedAt'),
				sheetRecord: _.omit(fakeSheetRecord, 'adjustedSheet'),
				guildDefaultCharacters: [],
				channelDefaultCharacters: [],
			});
		});
	});
	describe('updateFields', () => {
		it('updates a character', async () => {
			const fakeCharacter = await ResourceFactories.character();
			await vitestKobold.character.updateFields(
				{ id: fakeCharacter.id },
				{ name: 'new name' }
			);
			const read = await vitestKobold.character.read({ id: fakeCharacter.id });
			expect(read).toEqual({
				...fakeCharacter,
				name: 'new name',
			});
		});
		it('fails to update a character if the sheetRecordId is invalid', async () => {
			const fakeCharacter = await ResourceFactories.character();
			await expect(
				vitestKobold.character.updateFields({ id: fakeCharacter.id }, { sheetRecordId: -1 })
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
