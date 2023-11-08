import { CharacterFactory } from '../character/character.factory.js';
import { GuildDefaultCharacterFactory } from './guild-default-character.factory.js';
import { GuildDefaultCharacterModel } from './guild-default-character.model.js';
import { zGuildDefaultCharacter } from '../../schemas/zod-tables/guild-default-character.zod.js';

describe('GuildDefaultCharacter', () => {
	test('validates a built factory', () => {
		const builtGuildDefaultCharacter = GuildDefaultCharacterFactory.build();
		const valid = zGuildDefaultCharacter.safeParse(builtGuildDefaultCharacter);
		expect(valid.success).toBe(true);
	});
	test('validates a created factory object', async () => {
		const character = await CharacterFactory.create();
		const createdGuildDefaultCharacter = await GuildDefaultCharacterFactory.create({
			characterId: character.id,
		});
		const valid = zGuildDefaultCharacter.safeParse(createdGuildDefaultCharacter);
		expect(valid.success).toBe(true);
	});
	test('Model successfully inserts and retrieves a created character', async () => {
		const character = await CharacterFactory.create();
		const builtGuildDefaultCharacter = GuildDefaultCharacterFactory.build({
			characterId: character.id,
		});
		await GuildDefaultCharacterModel.query().insert(builtGuildDefaultCharacter);
		const fetchedGuildDefaultCharacters = await GuildDefaultCharacterModel.query();
		const insertedGuildDefaultCharacter = fetchedGuildDefaultCharacters.find(
			guildDefaultChars =>
				guildDefaultChars.characterId === builtGuildDefaultCharacter.characterId
		);
		expect(insertedGuildDefaultCharacter?.characterId).toBe(
			builtGuildDefaultCharacter.characterId
		);
	});
});
