import { CharacterFactory, createRandomModifiers } from './character.factory.js';
import { CharacterModel } from './character.model.js';
import { zCharacter } from '../../schemas/character.zod.js';

describe('Character', () => {
	test('validates a built factory', () => {
		const builtCharacter = CharacterFactory.build();
		const parseResult = zCharacter.safeParse(builtCharacter);
		expect(parseResult.success).toBe(true);
	});
	test('validates a created factory object', async () => {
		const createdCharacter = await CharacterFactory.create();
		const parseResult = zCharacter.safeParse(createdCharacter);
		expect(parseResult.success).toBe(true);
	});
	test('builds a character with a fake id', async () => {
		const builtCharacter = CharacterFactory.withFakeId().build();
		expect(builtCharacter).toHaveProperty('id');
	});
	test('builds a character with a given name', async () => {
		const builtCharacter = CharacterFactory.withName('testName').build();
		expect(builtCharacter.sheet.sourceData.characterData?.name).toBe('testName');
	});
	test('Model successfully inserts and retrieves a created character', async () => {
		const builtCharacter = CharacterFactory.build();
		await CharacterModel.query().insert(builtCharacter);
		const fetchedCharacters = await CharacterModel.query();
		const insertedCharacter = fetchedCharacters.find(
			character => character.charId === builtCharacter.charId
		);
		expect(insertedCharacter?.charId).toBe(builtCharacter.charId);
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
