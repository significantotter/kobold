import { CharacterFactory } from '../character/character.factory.js';
import Ajv from 'ajv';
import { ChannelDefaultCharacterFactory } from './channel-default-character.factory.js';
import { ChannelDefaultCharacter } from './channel-default-character.model.js';
import ChannelDefaultCharacterSchema from './channel-default-character.schema.json' assert { type: 'json' };
import addFormats from 'ajv-formats';
const ajv = new Ajv.default({ allowUnionTypes: true });
addFormats.default(ajv);

describe('ChannelDefaultCharacter', () => {
	test('validates a built factory', () => {
		const builtChannelDefaultCharacter = ChannelDefaultCharacterFactory.build();
		const valid = ajv.validate(ChannelDefaultCharacterSchema, builtChannelDefaultCharacter);
		expect(valid).toBe(true);
	});
	test('validates a created factory object', async () => {
		const character = await CharacterFactory.create();
		const createdChannelDefaultCharacter = await ChannelDefaultCharacterFactory.create({
			characterId: character.id,
		});
		const valid = ajv.validate(ChannelDefaultCharacterSchema, createdChannelDefaultCharacter);
		expect(valid).toBe(true);
	});
	test('Model successfully inserts and retrieves a created character', async () => {
		const character = await CharacterFactory.create();
		const builtChannelDefaultCharacter = ChannelDefaultCharacterFactory.build({
			characterId: character.id,
		});
		await ChannelDefaultCharacter.query().insert(builtChannelDefaultCharacter);
		const fetchedChannelDefaultCharacters = await ChannelDefaultCharacter.query();
		const insertedChannelDefaultCharacter = fetchedChannelDefaultCharacters.find(
			guildDefaultChars =>
				guildDefaultChars.characterId === builtChannelDefaultCharacter.characterId
		);
		expect(insertedChannelDefaultCharacter.characterId).toBe(
			builtChannelDefaultCharacter.characterId
		);
	});
});
