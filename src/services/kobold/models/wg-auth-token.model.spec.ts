import { generateMock } from '@anatine/zod-mock';
import {
	ResourceFactories,
	truncateDbForTests,
	vitestKobold,
} from '../../../utils/discord-test-utils.js';
import {
	InlineRollsDisplayEnum,
	RollCompactModeEnum,
	WgAuthToken,
	zWgAuthTokenInitializer,
} from '../index.js';
import _ from 'lodash';

describe('WgAuthTokenModel', () => {
	afterEach(async () => {
		await truncateDbForTests();
	});
	describe('create, read', () => {
		it('creates a new wgAuthToken, reads it, and returns the wgAuthToken plus relations', async () => {
			const fakeWgAuthTokenMock = generateMock(zWgAuthTokenInitializer);

			const created = await vitestKobold.wgAuthToken.create(fakeWgAuthTokenMock);
			const read = await vitestKobold.wgAuthToken.read({ id: created.id });
			expect(created).toMatchObject(fakeWgAuthTokenMock);
			expect(read).toMatchObject(fakeWgAuthTokenMock);
		});
	});
	describe('update', () => {
		it('updates a wgAuthToken', async () => {
			const fakeWgAuthToken = await ResourceFactories.wgAuthToken();
			const updated = await vitestKobold.wgAuthToken.update(
				{ id: fakeWgAuthToken.id },
				{ accessToken: 'foo' }
			);
			expect(updated).toEqual({
				...fakeWgAuthToken,
				accessToken: 'foo',
			});
		});
		it('fails to update a wgAuthToken if the wgAuthToken id is invalid', async () => {
			await expect(
				vitestKobold.wgAuthToken.update({ id: -1 }, { accessToken: 'foo' })
			).rejects.toThrow();
		});
	});
	describe('delete', () => {
		it('deletes a wgAuthToken', async () => {
			const fakeWgAuthToken = await ResourceFactories.wgAuthToken();
			await vitestKobold.wgAuthToken.delete({ id: fakeWgAuthToken.id });
			const read = await vitestKobold.wgAuthToken.read({ id: fakeWgAuthToken.id });
			expect(read).toEqual(null);
		});
		it('fails to delete a wgAuthToken if the wgAuthToken does not exist', async () => {
			await expect(vitestKobold.wgAuthToken.delete({ id: -1 })).rejects.toThrow();
		});
	});
});
