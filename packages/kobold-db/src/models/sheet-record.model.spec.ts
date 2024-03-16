import { generateMock } from '@anatine/zod-mock';
import { zSheetRecordInitializer } from '../index.js';
import _ from 'lodash';
import { truncateDbForTests, vitestKobold, ResourceFactories } from '../test-utils.js';

describe('SheetRecordModel', () => {
	afterEach(async () => {
		await truncateDbForTests();
	});
	describe('create, read', () => {
		it('creates a new sheetRecord, reads it, and returns the sheetRecord plus relations', async () => {
			const fakeSheetRecordMock = generateMock(zSheetRecordInitializer);

			const created = await vitestKobold.sheetRecord.create(fakeSheetRecordMock);
			const read = await vitestKobold.sheetRecord.read({ id: created.id });
			expect(created).toMatchObject(fakeSheetRecordMock);
			expect(read).toMatchObject(fakeSheetRecordMock);
		});
	});
	describe('update', () => {
		it('updates a sheetRecord', async () => {
			const fakeSheetRecord = await ResourceFactories.sheetRecord();
			const updated = await vitestKobold.sheetRecord.update(
				{ id: fakeSheetRecord.id },
				{ trackerMessageId: 'foo' }
			);
			expect(updated).toEqual({
				...fakeSheetRecord,
				trackerMessageId: 'foo',
			});
		});
		it('fails to update a sheetRecord if the sheetRecord id is invalid', async () => {
			await expect(
				vitestKobold.sheetRecord.update({ id: -1 }, { trackerMessageId: 'foo' })
			).rejects.toThrow();
		});
	});
	describe('delete', () => {
		it('deletes a sheetRecord', async () => {
			const fakeSheetRecord = await ResourceFactories.sheetRecord();
			await vitestKobold.sheetRecord.delete({ id: fakeSheetRecord.id });
			const read = await vitestKobold.sheetRecord.read({ id: fakeSheetRecord.id });
			expect(read).toEqual(null);
		});
		it('fails to delete a sheetRecord if the sheetRecord does not exist', async () => {
			await expect(vitestKobold.sheetRecord.delete({ id: -1 })).rejects.toThrow();
		});
	});
	describe('deleteOrphaned', () => {
		it('deletes orphaned sheetRecords', async () => {
			const initActor2 = await ResourceFactories.initiativeActor();
			const [orphanedSheetRecord, character, initActor, character2] = await Promise.all([
				ResourceFactories.sheetRecord(),
				ResourceFactories.character(),
				ResourceFactories.initiativeActor(),
				ResourceFactories.character({ sheetRecordId: initActor2.sheetRecordId }),
			]);

			const result = await vitestKobold.sheetRecord.deleteOrphaned();
			expect(result.numDeletedRows).toEqual(BigInt(1));

			// Assert: Check that the orphaned records were deleted
			const allRecords = await vitestKobold.db
				.selectFrom('sheetRecord')
				.select('id')
				.execute();
			const allIds = allRecords.map(r => r.id);
			// Note: You'll need to replace this with actual code to check the records
			expect(allIds).not.toContain(orphanedSheetRecord.id);
			expect(allIds).toContain(character.sheetRecordId);
			expect(allIds).toContain(initActor.sheetRecordId);
			expect(allIds).toContain(character2.sheetRecordId);
			expect(allIds).toContain(initActor2.sheetRecordId);
		});
	});
});
