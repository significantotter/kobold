import { CharacterFactory } from './../character/character.factory.js';
import Ajv from 'ajv';
import { UserSettingsFactory } from './user-settings.factory.js';
import { UserSettings } from './user-settings.model.js';
import UserSettingsSchema from './user-settings.schema.json' assert { type: 'json' };
import addFormats from 'ajv-formats';
const ajv = new Ajv.default({ allowUnionTypes: true });
addFormats.default(ajv);

describe('UserSettings', () => {
	test('validates a built factory', () => {
		const builtUserSettings = UserSettingsFactory.build();
		const valid = ajv.validate(UserSettingsSchema, builtUserSettings);
		expect(valid).toBe(true);
	});
	test('validates a created factory object', async () => {
		const character = await CharacterFactory.create();
		const createdUserSettings = await UserSettingsFactory.create({
			userId: 'foo',
		});
		const valid = ajv.validate(UserSettingsSchema, createdUserSettings);
		expect(valid).toBe(true);
	});
});
