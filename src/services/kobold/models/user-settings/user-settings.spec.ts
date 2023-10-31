import { CharacterFactory } from './../character/character.factory.js';
import Ajv from 'ajv';
import { UserSettingsFactory } from './user-settings.factory.js';
import addFormats from 'ajv-formats';
import { zUserSettings } from '../../schemas/user-settings.zod.js';

describe('UserSettings', () => {
	test('validates a built factory', () => {
		const builtUserSettings = UserSettingsFactory.build();
		const valid = zUserSettings.safeParse(builtUserSettings);
		expect(valid.success).toBe(true);
	});
	test('validates a created factory object', async () => {
		const character = await CharacterFactory.create();
		const createdUserSettings = await UserSettingsFactory.create({
			userId: 'foo',
		});
		const valid = zUserSettings.safeParse(createdUserSettings);
		expect(valid.success).toBe(true);
	});
});
