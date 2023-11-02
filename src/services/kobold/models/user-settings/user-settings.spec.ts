import { UserSettingsFactory } from './user-settings.factory.js';
import { zUserSettings } from '../../schemas/user-settings.zod.js';

describe('UserSettings', () => {
	test('validates a built factory', () => {
		const builtUserSettings = UserSettingsFactory.build();
		const valid = zUserSettings.safeParse(builtUserSettings.toJSON());
		if (!valid.success) console.log((valid as any)?.error);
		expect(valid.success).toBe(true);
	});
	test('validates a created factory object', async () => {
		const createdUserSettings = await UserSettingsFactory.create({
			userId: 'foo',
		});
		const valid = zUserSettings.safeParse(createdUserSettings.toJSON());
		expect(valid.success).toBe(true);
	});
});
