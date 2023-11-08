import { Database } from '../schemas/index.js';
import { ExpressionBuilder } from 'kysely';
import { jsonArrayFrom, jsonObjectFrom } from 'kysely/helpers/postgres';

export function channelDefaultCharacterForCharacter(
	eb: ExpressionBuilder<Database, 'character'>,
	{ channelId, userId }: { channelId?: string; userId?: string } = {}
) {
	return jsonArrayFrom(
		eb
			.selectFrom('channelDefaultCharacter')
			.selectAll('channelDefaultCharacter')
			.whereRef('channelDefaultCharacter.characterId', '=', 'character.id')
			.where(ebChannel => {
				const ands = [];
				if (userId != null) {
					ands.push(ebChannel(`channelDefaultCharacter.userId`, '=', userId));
				}
				if (channelId != null) {
					ands.push(ebChannel(`channelDefaultCharacter.channelId`, '=', channelId));
				}
				return ebChannel.and(ands);
			})
	).as('channelDefaultCharacters');
}

export function guildDefaultCharacterForCharacter(
	eb: ExpressionBuilder<Database, 'character'>,
	{ guildId, userId }: { guildId?: string; userId?: string } = {}
) {
	return jsonArrayFrom(
		eb
			.selectFrom('guildDefaultCharacter')
			.selectAll('guildDefaultCharacter')
			.whereRef('guildDefaultCharacter.characterId', '=', 'character.id')
			.where(ebChannel => {
				const ands = [];
				if (userId != null) {
					ands.push(ebChannel(`guildDefaultCharacter.userId`, '=', userId));
				}
				if (guildId != null) {
					ands.push(ebChannel(`guildDefaultCharacter.guildId`, '=', guildId));
				}
				return ebChannel.and(ands);
			})
	).as('guildDefaultCharacters');
}
