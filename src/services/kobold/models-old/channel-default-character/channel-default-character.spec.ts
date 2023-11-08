import { CharacterFactory } from '../character/character.factory.js';
import { ChannelDefaultCharacterFactory } from './channel-default-character.factory.js';
import { ChannelDefaultCharacterModel } from './channel-default-character.model.js';
import { zChannelDefaultCharacter } from '../../schemas/zod-tables/channel-default-character.zod.js';

describe('ChannelDefaultCharacter', () => {
	test('validates a built factory', () => {
		const builtChannelDefaultCharacter = ChannelDefaultCharacterFactory.build();
		const valid = zChannelDefaultCharacter.safeParse(builtChannelDefaultCharacter);
		expect(valid.success).toBe(true);
	});
	test('validates a created factory object', async () => {
		const character = await CharacterFactory.create();
		const createdChannelDefaultCharacter = await ChannelDefaultCharacterFactory.create({
			characterId: character.id,
		});
		const valid = zChannelDefaultCharacter.safeParse(createdChannelDefaultCharacter);
		expect(valid.success).toBe(true);
	});
	test('Model successfully inserts and retrieves a created character', async () => {
		const character = await CharacterFactory.create();
		const builtChannelDefaultCharacter = ChannelDefaultCharacterFactory.build({
			characterId: character.id,
		});
		await ChannelDefaultCharacterModel.query().insert(builtChannelDefaultCharacter);
		const fetchedChannelDefaultCharacters = await ChannelDefaultCharacterModel.query();
		const insertedChannelDefaultCharacter = fetchedChannelDefaultCharacters.find(
			guildDefaultChars =>
				guildDefaultChars.characterId === builtChannelDefaultCharacter.characterId
		);
		expect(insertedChannelDefaultCharacter?.characterId).toBe(
			builtChannelDefaultCharacter.characterId
		);
	});
});
