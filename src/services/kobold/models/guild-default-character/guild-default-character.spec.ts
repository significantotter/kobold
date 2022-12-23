import { CharacterFactory } from './../character/character.factory.js';
import Ajv from 'ajv';
import { GuildDefaultCharacterFactory } from './guild-default-character.factory.js';
import { GuildDefaultCharacter } from './guild-default-character.model.js';
import GuildDefaultCharacterSchema from './guild-default-character.schema.json';
import addFormats from 'ajv-formats';
const ajv = new Ajv({ allowUnionTypes: true });
addFormats(ajv);

describe('GuildDefaultCharacter', () => {
	test('validates a built factory', () => {
		const builtGuildDefaultCharacter = GuildDefaultCharacterFactory.build();
		const valid = ajv.validate(GuildDefaultCharacterSchema, builtGuildDefaultCharacter);
		expect(valid).toBe(true);
	});
	test('validates a created factory object', async () => {
		const character = await CharacterFactory.create();
		const createdGuildDefaultCharacter = await GuildDefaultCharacterFactory.create({
			characterId: character.id,
		});
		const valid = ajv.validate(GuildDefaultCharacterSchema, createdGuildDefaultCharacter);
		expect(valid).toBe(true);
	});
	test('Model successfully inserts and retrieves a created character', async () => {
		const character = await CharacterFactory.create();
		const builtGuildDefaultCharacter = GuildDefaultCharacterFactory.build({
			characterId: character.id,
		});
		await GuildDefaultCharacter.query().insert(builtGuildDefaultCharacter);
		const fetchedGuildDefaultCharacters = await GuildDefaultCharacter.query();
		const insertedGuildDefaultCharacter = fetchedGuildDefaultCharacters.find(
			guildDefaultChars =>
				guildDefaultChars.characterId === builtGuildDefaultCharacter.characterId
		);
		expect(insertedGuildDefaultCharacter.characterId).toBe(
			builtGuildDefaultCharacter.characterId
		);
	});
});
