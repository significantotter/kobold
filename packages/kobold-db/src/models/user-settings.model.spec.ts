import {
	InlineRollsDisplayEnum,
	RollCompactModeEnum,
	UserSettings,
	zUserSettingsInitializer,
} from '../index.js';
import _ from 'lodash';
import { truncateDbForTests, vitestKobold, ResourceFactories, fake } from '../test-utils.js';

describe('UserSettingsModel', () => {
	afterEach(async () => {
		await truncateDbForTests();
	});
	describe('create, read', () => {
		it('creates a new userSettings, reads it, and returns the userSettings plus relations', async () => {
			const fakeUserSettingsMock = fake(zUserSettingsInitializer);

			const created = await vitestKobold.userSettings.create(fakeUserSettingsMock);
			const read = await vitestKobold.userSettings.read({ userId: created.userId });
			expect(created).toMatchObject(fakeUserSettingsMock);
			expect(read).toMatchObject(fakeUserSettingsMock);
		});
	});
	describe('update', () => {
		it('updates a userSettings', async () => {
			const fakeUserSettings = await ResourceFactories.userSettings();
			const updated = await vitestKobold.userSettings.update(
				{ userId: fakeUserSettings.userId },
				{ rollCompactMode: RollCompactModeEnum.compact }
			);
			expect(updated).toEqual({
				...fakeUserSettings,
				rollCompactMode: RollCompactModeEnum.compact,
			});
		});
		it('fails to update a userSettings if the userSettings id is invalid', async () => {
			await expect(
				vitestKobold.userSettings.update(
					{ userId: '' },
					{ inlineRollsDisplay: InlineRollsDisplayEnum.detailed }
				)
			).rejects.toThrow();
		});
	});
	describe('delete', () => {
		it('deletes a userSettings', async () => {
			const fakeUserSettings = await ResourceFactories.userSettings();
			await vitestKobold.userSettings.delete({ userId: fakeUserSettings.userId });
			const read = await vitestKobold.userSettings.read({ userId: fakeUserSettings.userId });
			expect(read).toEqual(null);
		});
		it('fails to delete a userSettings if the userSettings does not exist', async () => {
			await expect(vitestKobold.userSettings.delete({ userId: '' })).rejects.toThrow();
		});
	});
});
