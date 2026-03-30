import { ExpressionBuilder } from 'kysely';
import { jsonArrayFrom, jsonObjectFrom } from 'kysely/helpers/postgres';
import {
	Action,
	Database,
	Game,
	Minion,
	Modifier,
	RollMacro,
	SheetRecord,
} from '../schemas/index.js';

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

/**
 * Fetches actions for a character including:
 * - Character-specific actions (sheetRecordId matches character's sheetRecordId)
 * - User-wide actions (sheetRecordId is null) where userId matches character's userId
 */
export function actionsForCharacter(eb: ExpressionBuilder<Database, 'character'>) {
	return jsonArrayFrom(
		eb
			.selectFrom('action')
			.selectAll('action')
			.where(eb2 =>
				eb2.or([
					eb2.and([
						eb2('action.sheetRecordId', 'is', null),
						eb2.eb('action.userId', '=', eb2.ref('character.userId')),
					]),
					eb2.eb('action.sheetRecordId', '=', eb2.ref('character.sheetRecordId')),
				])
			)
	)
		.$castTo<Action[]>()
		.as('actions');
}

/**
 * Fetches modifiers for a character including:
 * - Character-specific modifiers (sheetRecordId matches character's sheetRecordId)
 * - User-wide modifiers (sheetRecordId is null) where userId matches character's userId
 */
export function modifiersForCharacter(eb: ExpressionBuilder<Database, 'character'>) {
	return jsonArrayFrom(
		eb
			.selectFrom('modifier')
			.selectAll('modifier')
			.where(eb2 =>
				eb2.or([
					eb2.and([
						eb2('modifier.sheetRecordId', 'is', null),
						eb2.eb('modifier.userId', '=', eb2.ref('character.userId')),
					]),
					eb2.eb('modifier.sheetRecordId', '=', eb2.ref('character.sheetRecordId')),
				])
			)
	)
		.$castTo<Modifier[]>()
		.as('modifiers');
}

/**
 * Fetches roll macros for a character including:
 * - Character-specific roll macros (sheetRecordId matches character's sheetRecordId)
 * - User-wide roll macros (sheetRecordId is null) where userId matches character's userId
 */
export function rollMacrosForCharacter(eb: ExpressionBuilder<Database, 'character'>) {
	return jsonArrayFrom(
		eb
			.selectFrom('rollMacro')
			.selectAll('rollMacro')
			.where(eb2 =>
				eb2.or([
					eb2.and([
						eb2('rollMacro.sheetRecordId', 'is', null),
						eb2.eb('rollMacro.userId', '=', eb2.ref('character.userId')),
					]),
					eb2.eb('rollMacro.sheetRecordId', '=', eb2.ref('character.sheetRecordId')),
				])
			)
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

/**
 * Fetches actions for an initiative actor including:
 * - Actor-specific actions (sheetRecordId matches actor's sheetRecordId)
 * - User-wide actions (sheetRecordId is null) where userId matches actor's userId
 */
export function actionsForActor(eb: ExpressionBuilder<Database, 'initiativeActor'>) {
	return jsonArrayFrom(
		eb
			.selectFrom('action')
			.selectAll('action')
			.where(eb2 =>
				eb2.or([
					eb2.and([
						eb2('action.sheetRecordId', 'is', null),
						eb2.eb('action.userId', '=', eb2.ref('initiativeActor.userId')),
					]),
					eb2.eb('action.sheetRecordId', '=', eb2.ref('initiativeActor.sheetRecordId')),
				])
			)
	)
		.$castTo<Action[]>()
		.as('actions');
}

/**
 * Fetches modifiers for an initiative actor including:
 * - Actor-specific modifiers (sheetRecordId matches actor's sheetRecordId)
 * - User-wide modifiers (sheetRecordId is null) where userId matches actor's userId
 */
export function modifiersForActor(eb: ExpressionBuilder<Database, 'initiativeActor'>) {
	return jsonArrayFrom(
		eb
			.selectFrom('modifier')
			.selectAll('modifier')
			.where(eb2 =>
				eb2.or([
					eb2.and([
						eb2('modifier.sheetRecordId', 'is', null),
						eb2.eb('modifier.userId', '=', eb2.ref('initiativeActor.userId')),
					]),
					eb2.eb('modifier.sheetRecordId', '=', eb2.ref('initiativeActor.sheetRecordId')),
				])
			)
	)
		.$castTo<Modifier[]>()
		.as('modifiers');
}

/**
 * Fetches roll macros for an initiative actor including:
 * - Actor-specific roll macros (sheetRecordId matches actor's sheetRecordId)
 * - User-wide roll macros (sheetRecordId is null) where userId matches actor's userId
 */
export function rollMacrosForActor(eb: ExpressionBuilder<Database, 'initiativeActor'>) {
	return jsonArrayFrom(
		eb
			.selectFrom('rollMacro')
			.selectAll('rollMacro')
			.where(eb2 =>
				eb2.or([
					eb2.and([
						eb2('rollMacro.sheetRecordId', 'is', null),
						eb2.eb('rollMacro.userId', '=', eb2.ref('initiativeActor.userId')),
					]),
					eb2.eb(
						'rollMacro.sheetRecordId',
						'=',
						eb2.ref('initiativeActor.sheetRecordId')
					),
				])
			)
	)
		.$castTo<RollMacro[]>()
		.as('rollMacros');
}

export function minionForActor(eb: ExpressionBuilder<Database, 'initiativeActor'>) {
	return jsonObjectFrom(
		eb
			.selectFrom('minion')
			.selectAll('minion')
			.whereRef('minion.id', '=', 'initiativeActor.minionId')
	)
		.$castTo<Minion | null>()
		.as('minion');
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
		minionForActor(eb),
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

/**
 * Fetches actions for a minion including:
 * - Minion-specific actions (sheetRecordId matches minion's sheetRecordId)
 * - User-wide actions (sheetRecordId is null) where userId matches minion's userId
 */
export function actionsForMinion(eb: ExpressionBuilder<Database, 'minion'>) {
	return jsonArrayFrom(
		eb
			.selectFrom('action')
			.selectAll('action')
			.where(eb2 =>
				eb2.or([
					eb2.and([
						eb2('action.sheetRecordId', 'is', null),
						eb2.eb('action.userId', '=', eb2.ref('minion.userId')),
					]),
					eb2.eb('action.sheetRecordId', '=', eb2.ref('minion.sheetRecordId')),
				])
			)
	)
		.$castTo<Action[]>()
		.as('actions');
}

/**
 * Fetches modifiers for a minion including:
 * - Minion-specific modifiers (sheetRecordId matches minion's sheetRecordId)
 * - User-wide modifiers (sheetRecordId is null) where userId matches minion's userId
 */
export function modifiersForMinion(eb: ExpressionBuilder<Database, 'minion'>) {
	return jsonArrayFrom(
		eb
			.selectFrom('modifier')
			.selectAll('modifier')
			.where(eb2 =>
				eb2.or([
					eb2.and([
						eb2('modifier.sheetRecordId', 'is', null),
						eb2.eb('modifier.userId', '=', eb2.ref('minion.userId')),
					]),
					eb2.eb('modifier.sheetRecordId', '=', eb2.ref('minion.sheetRecordId')),
				])
			)
	)
		.$castTo<Modifier[]>()
		.as('modifiers');
}

/**
 * Fetches roll macros for a minion including:
 * - Minion-specific roll macros (sheetRecordId matches minion's sheetRecordId)
 * - User-wide roll macros (sheetRecordId is null) where userId matches minion's userId
 */
export function rollMacrosForMinion(eb: ExpressionBuilder<Database, 'minion'>) {
	return jsonArrayFrom(
		eb
			.selectFrom('rollMacro')
			.selectAll('rollMacro')
			.where(eb2 =>
				eb2.or([
					eb2.and([
						eb2('rollMacro.sheetRecordId', 'is', null),
						eb2.eb('rollMacro.userId', '=', eb2.ref('minion.userId')),
					]),
					eb2.eb('rollMacro.sheetRecordId', '=', eb2.ref('minion.sheetRecordId')),
				])
			)
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
