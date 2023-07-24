import { CharacterFactory } from './../character/character.factory.js';
import Ajv from 'ajv';
import { UserSettingsFactory } from './user-settings.factory.js';
import { UserSettings } from './user-settings.model.js';
import UserSettingsSchema from './user-settings.schema.json';
import addFormats from 'ajv-formats';
const ajv = new Ajv({ allowUnionTypes: true });
addFormats(ajv);

describe('UserSettings', () => {
	test('validates a built factory', () => {
		const builtUserSettings = UserSettingsFactory.build();
		const valid = ajv.validate(UserSettingsSchema, builtUserSettings);
		expect(valid).toBe(true);
	});
	test('validates a created factory object', async () => {
		const character = await CharacterFactory.create();
		const createdUserSettings = await UserSettingsFactory.create({
			characterId: character.id,
		});
		const valid = ajv.validate(UserSettingsSchema, createdUserSettings);
		expect(valid).toBe(true);
	});
	test('Model successfully inserts and retrieves a created character', async () => {
		const character = await CharacterFactory.create();
		const builtUserSettings = UserSettingsFactory.build({
			characterId: character.id,
		});
		await UserSettings.query().insert(builtUserSettings);
		const fetchedUserSettings = await UserSettings.query();
		const insertedUserSettings = fetchedUserSettings.find(
			guildDefaultChars => guildDefaultChars.characterId === builtUserSettings.characterId
		);
		expect(insertedUserSettings.characterId).toBe(builtUserSettings.characterId);
	});
});
