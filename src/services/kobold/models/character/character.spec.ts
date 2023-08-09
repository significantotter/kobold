import Ajv from 'ajv';
import { CharacterFactory, createRandomModifiers } from './character.factory.js';
import { Character } from './character.model.js';
import CharacterSchema from './character.schema.json' assert { type: 'json' };
import addFormats from 'ajv-formats';
import { CharacterDataFactory } from '../../../wanderers-guide/character-api/factories/characterData.factory.js';
const ajv = new Ajv.default({ allowUnionTypes: true });
addFormats.default(ajv);

describe.only('Character', () => {
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

	describe('queryControlledCharacterByName', () => {
		beforeAll(async () => {
			await Character.knex().raw('TRUNCATE Character CASCADE');
		});
		test('fetches a character by name with case insensitivity', async () => {
			const builtCharacter = CharacterFactory.build({
				userId: '1',
				name: 'aSdFqWeRtYuI',
				characterData: CharacterDataFactory.build({ name: 'aSdFqWeRtYuI' }),
			});
			const createdCharacter = await Character.query().insert(builtCharacter);
			const looseFetch = await Character.queryControlledCharacterByName('sDfQwE', '1');
			expect(looseFetch).toHaveProperty('length', 1);
			expect(looseFetch[0].characterData).toHaveProperty('name', 'aSdFqWeRtYuI');
		});
	});
	describe('getModifierByName', () => {
		test('fetches a modifiers name, trimming it and converting to lower case', () => {
			const modifiers = createRandomModifiers(2);
			modifiers[0].name = 'aSDf ';
			modifiers[1].name = 'qwasdfer';
			const character = CharacterFactory.build({
				modifiers: modifiers,
			});
			const modifier = character.getModifierByName(' AsdF');
			expect(modifier).toStrictEqual(modifiers[0]);
		});
	});
});
