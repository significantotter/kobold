import { generateMock } from '@anatine/zod-mock';
import {
	ResourceFactories,
	truncateDbForTests,
	vitestKobold,
} from '../../../utils/discord-test-utils.js';
import { SheetRecord, zSheetRecordInitializer } from '../index.js';
import _ from 'lodash';

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
});
