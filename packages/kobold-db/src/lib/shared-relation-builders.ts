import { ExpressionBuilder } from 'kysely';
import { jsonArrayFrom, jsonObjectFrom } from 'kysely/helpers/postgres';
import { Action, Database, Game, Modifier, RollMacro, SheetRecord } from '../schemas/index.js';

// ============================================================================
// Sheet Record Relations for Character
// ============================================================================

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

export function actionsForCharacter(eb: ExpressionBuilder<Database, 'character'>) {
	return jsonArrayFrom(
		eb
			.selectFrom('action')
			.selectAll('action')
			.whereRef('action.sheetRecordId', '=', 'character.sheetRecordId')
	)
		.$castTo<Action[]>()
		.as('actions');
}

export function modifiersForCharacter(eb: ExpressionBuilder<Database, 'character'>) {
	return jsonArrayFrom(
		eb
			.selectFrom('modifier')
			.selectAll('modifier')
			.whereRef('modifier.sheetRecordId', '=', 'character.sheetRecordId')
	)
		.$castTo<Modifier[]>()
		.as('modifiers');
}

export function rollMacrosForCharacter(eb: ExpressionBuilder<Database, 'character'>) {
	return jsonArrayFrom(
		eb
			.selectFrom('rollMacro')
			.selectAll('rollMacro')
			.whereRef('rollMacro.sheetRecordId', '=', 'character.sheetRecordId')
	)
		.$castTo<RollMacro[]>()
		.as('rollMacros');
}

/**
 * Returns all sheet-related relations for a character.
 * Use with spread: `.select(eb => [...sheetRelationsForCharacter(eb)])`
 */
export function sheetRelationsForCharacter(eb: ExpressionBuilder<Database, 'character'>) {
	return [
		sheetRecordForCharacter(eb),
		actionsForCharacter(eb),
		modifiersForCharacter(eb),
		rollMacrosForCharacter(eb),
	] as const;
}

// ============================================================================
// Sheet Record Relations for Initiative Actor
// ============================================================================

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

export function actionsForActor(eb: ExpressionBuilder<Database, 'initiativeActor'>) {
	return jsonArrayFrom(
		eb
			.selectFrom('action')
			.selectAll('action')
			.whereRef('action.sheetRecordId', '=', 'initiativeActor.sheetRecordId')
	)
		.$castTo<Action[]>()
		.as('actions');
}

export function modifiersForActor(eb: ExpressionBuilder<Database, 'initiativeActor'>) {
	return jsonArrayFrom(
		eb
			.selectFrom('modifier')
			.selectAll('modifier')
			.whereRef('modifier.sheetRecordId', '=', 'initiativeActor.sheetRecordId')
	)
		.$castTo<Modifier[]>()
		.as('modifiers');
}

export function rollMacrosForActor(eb: ExpressionBuilder<Database, 'initiativeActor'>) {
	return jsonArrayFrom(
		eb
			.selectFrom('rollMacro')
			.selectAll('rollMacro')
			.whereRef('rollMacro.sheetRecordId', '=', 'initiativeActor.sheetRecordId')
	)
		.$castTo<RollMacro[]>()
		.as('rollMacros');
}

/**
 * Returns all sheet-related relations for an initiative actor.
 * Use with spread: `.select(eb => [...sheetRelationsForActor(eb)])`
 */
export function sheetRelationsForActor(eb: ExpressionBuilder<Database, 'initiativeActor'>) {
	return [
		sheetRecordForActor(eb),
		actionsForActor(eb),
		modifiersForActor(eb),
		rollMacrosForActor(eb),
	] as const;
}

// ============================================================================
// Sheet Record Relations for Minion
// ============================================================================

export function sheetRecordForMinion(eb: ExpressionBuilder<Database, 'minion'>) {
	return jsonObjectFrom(
		eb
			.selectFrom('sheetRecord')
			.selectAll('sheetRecord')
			.whereRef('sheetRecord.id', '=', 'minion.sheetRecordId')
	)
		.$castTo<SheetRecord>()
		.as('sheetRecord');
}

export function actionsForMinion(eb: ExpressionBuilder<Database, 'minion'>) {
	return jsonArrayFrom(
		eb
			.selectFrom('action')
			.selectAll('action')
			.whereRef('action.sheetRecordId', '=', 'minion.sheetRecordId')
	)
		.$castTo<Action[]>()
		.as('actions');
}

export function modifiersForMinion(eb: ExpressionBuilder<Database, 'minion'>) {
	return jsonArrayFrom(
		eb
			.selectFrom('modifier')
			.selectAll('modifier')
			.whereRef('modifier.sheetRecordId', '=', 'minion.sheetRecordId')
	)
		.$castTo<Modifier[]>()
		.as('modifiers');
}

export function rollMacrosForMinion(eb: ExpressionBuilder<Database, 'minion'>) {
	return jsonArrayFrom(
		eb
			.selectFrom('rollMacro')
			.selectAll('rollMacro')
			.whereRef('rollMacro.sheetRecordId', '=', 'minion.sheetRecordId')
	)
		.$castTo<RollMacro[]>()
		.as('rollMacros');
}

/**
 * Returns all sheet-related relations for a minion.
 * Use with spread: `.select(eb => [...sheetRelationsForMinion(eb)])`
 */
export function sheetRelationsForMinion(eb: ExpressionBuilder<Database, 'minion'>) {
	return [
		sheetRecordForMinion(eb),
		actionsForMinion(eb),
		modifiersForMinion(eb),
		rollMacrosForMinion(eb),
	] as const;
}

// ============================================================================
// Other Character Relations
// ============================================================================

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

export function gameForCharacter(eb: ExpressionBuilder<Database, 'character'>) {
	return jsonObjectFrom(
		eb.selectFrom('game').selectAll('game').whereRef('game.id', '=', 'character.gameId')
	)
		.$castTo<Game>()
		.as('game');
}
