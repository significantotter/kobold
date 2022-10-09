import Ajv from 'ajv';
import { CharacterFactory } from './character.factory.js';
import { Character } from './character.model.js';
import CharacterSchema from './character.schema.json';
import addFormats from 'ajv-formats';
const ajv = new Ajv({ allowUnionTypes: true });
addFormats(ajv);

describe('Character', () => {
	test('validates a built factory', () => {
		const builtCharacter = CharacterFactory.build();
		const valid = ajv.validate(CharacterSchema, builtCharacter);
		expect(valid).toBe(true);
	});
	test('validates a created factory object', async () => {
		const createdCharacter = await CharacterFactory.create();
		const valid = ajv.validate(CharacterSchema, createdCharacter);
		expect(valid).toBe(true);
	});
	test('builds a character with a fake id', async () => {
		const builtCharacter = CharacterFactory.withFakeId().build();
		expect(builtCharacter).toHaveProperty('id');
	});
	test('builds a character with a given name', async () => {
		const builtCharacter = CharacterFactory.withName('testName').build();
		expect(builtCharacter.characterData.name).toBe('testName');
	});
	test('Model successfully inserts and retrieves a created character', async () => {
		const builtCharacter = CharacterFactory.build();
		await Character.query().insert(builtCharacter);
		const fetchedCharacters = await Character.query();
		const insertedCharacter = fetchedCharacters.find(
			character => character.charId === builtCharacter.charId
		);
		expect(insertedCharacter.charId).toBe(builtCharacter.charId);
	});
});
