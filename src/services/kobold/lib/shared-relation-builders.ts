import { ExpressionBuilder } from 'kysely';
import { jsonArrayFrom, jsonObjectFrom } from 'kysely/helpers/postgres';
import { Database, SheetRecord } from '../schemas/index.js';

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
				if (userId !== undefined) {
					ands.push(ebChannel(`channelDefaultCharacter.userId`, '=', userId));
				}
				if (channelId !== undefined) {
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
				if (userId !== undefined) {
					ands.push(ebChannel(`guildDefaultCharacter.userId`, '=', userId));
				}
				if (guildId !== undefined) {
					ands.push(ebChannel(`guildDefaultCharacter.guildId`, '=', guildId));
				}
				return ebChannel.and(ands);
			})
	).as('guildDefaultCharacters');
}

export function sheetRecordForActor(eb: ExpressionBuilder<Database, 'initiativeActor'>) {
	return jsonObjectFrom(
		eb
			.selectFrom('sheetRecord')
			.selectAll('sheetRecord')
			.whereRef('sheetRecord.id', '=', 'initiativeActor.sheetRecordId')
	)
		.$castTo<SheetRecord>()
		.as('sheetRecord');
}

export function sheetRecordForCharacter(eb: ExpressionBuilder<Database, 'character'>) {
	return jsonObjectFrom(
		eb
			.selectFrom('sheetRecord')
			.selectAll('sheetRecord')
			.whereRef('sheetRecord.id', '=', 'character.sheetRecordId')
	)
		.$castTo<SheetRecord>()
		.as('sheetRecord');
}
