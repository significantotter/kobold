import { ExpressionBuilder, RawBuilder, sql } from 'kysely';
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

/**
 * Fetches all sheet_record columns EXCEPT adjusted_sheet (base sheet only).
 * Use for write paths where the command modifies and saves the base sheet.
 */
export function sheetRecordForCharacter(eb: ExpressionBuilder<Database, 'character'>) {
	return jsonObjectFrom(
		eb
			.selectFrom('sheetRecord')
			.select([
				'sheetRecord.id',
				'sheetRecord.sheet',
				'sheetRecord.conditions',
				'sheetRecord.trackerMode',
				'sheetRecord.trackerChannelId',
				'sheetRecord.trackerGuildId',
				'sheetRecord.trackerMessageId',
			])
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
 * Fetches modifiers for a character.
 * Only includes character-specific modifiers (sheetRecordId matches character's sheetRecordId).
 * Unassigned (user-wide) modifiers are not included.
 */
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
// Selective / Lightweight Relation Builders for Character
// ============================================================================

/**
 * Fetches only lightweight sheet_record fields (id, conditions, trackerMode) — no full sheet JSON.
 */
export function sheetRecordLiteForCharacter(eb: ExpressionBuilder<Database, 'character'>) {
	return jsonObjectFrom(
		eb
			.selectFrom('sheetRecord')
			.select(['sheetRecord.id', 'sheetRecord.conditions', 'sheetRecord.trackerMode'])
			.whereRef('sheetRecord.id', '=', 'character.sheetRecordId')
	)
		.$castTo<Pick<SheetRecord, 'id' | 'conditions' | 'trackerMode'>>()
		.as('sheetRecord');
}

/**
 * Fetches a specific top-level JSON field from the sheet_record's sheet column.
 * Uses Postgres JSONB path extraction.
 */
export function sheetRecordFieldForCharacter<T = unknown>(
	eb: ExpressionBuilder<Database, 'character'>,
	jsonPath: string,
	alias: string
) {
	return jsonObjectFrom(
		eb
			.selectFrom('sheetRecord')
			.select(sql`"sheet_record"."sheet" -> ${sql.raw(`'${jsonPath}'`)}` as any)
			.whereRef('sheetRecord.id', '=', 'character.sheetRecordId')
	)
		.$castTo<T>()
		.as(alias);
}

/**
 * Returns only the modifiers relation for a character (no sheetRecord, actions, or rollMacros).
 */
export function modifiersOnlyForCharacter(eb: ExpressionBuilder<Database, 'character'>) {
	return [modifiersForCharacter(eb)] as const;
}

// ============================================================================
// Sheet Record Relations for Initiative Actor
// ============================================================================

/**
 * Fetches all sheet_record columns EXCEPT adjusted_sheet (base sheet only).
 * Use for write paths where the command modifies and saves the base sheet.
 */
export function sheetRecordForActor(eb: ExpressionBuilder<Database, 'initiativeActor'>) {
	return jsonObjectFrom(
		eb
			.selectFrom('sheetRecord')
			.select([
				'sheetRecord.id',
				'sheetRecord.sheet',
				'sheetRecord.conditions',
				'sheetRecord.trackerMode',
				'sheetRecord.trackerChannelId',
				'sheetRecord.trackerGuildId',
				'sheetRecord.trackerMessageId',
			])
			.whereRef('sheetRecord.id', '=', 'initiativeActor.sheetRecordId')
	)
		.$castTo<SheetRecord>()
		.as('sheetRecord');
}

/**
 * Fetches COALESCE(adjusted_sheet, sheet) as sheet — no raw sheet or adjusted_sheet.
 * Use for display-only paths where the pre-computed adjusted values are sufficient.
 * Saves ~40KB per row by reading only one JSONB blob.
 */
export function sheetRecordCachedForActor(eb: ExpressionBuilder<Database, 'initiativeActor'>) {
	return jsonObjectFrom(
		eb
			.selectFrom('sheetRecord')
			.select(['sheetRecord.id', 'sheetRecord.conditions', 'sheetRecord.trackerMode'])
			.select(
				sql<
					SheetRecord['sheet']
				>`COALESCE("sheet_record"."adjusted_sheet", "sheet_record"."sheet")`.as('sheet')
			)
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
 * Fetches modifiers for an initiative actor.
 * Only includes actor-specific modifiers (sheetRecordId matches actor's sheetRecordId).
 * Unassigned (user-wide) modifiers are not included.
 */
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

/**
 * Fetches all sheet_record columns EXCEPT adjusted_sheet (base sheet only).
 * Use for write paths where the command modifies and saves the base sheet.
 */
export function sheetRecordForMinion(eb: ExpressionBuilder<Database, 'minion'>) {
	return jsonObjectFrom(
		eb
			.selectFrom('sheetRecord')
			.select([
				'sheetRecord.id',
				'sheetRecord.sheet',
				'sheetRecord.conditions',
				'sheetRecord.trackerMode',
				'sheetRecord.trackerChannelId',
				'sheetRecord.trackerGuildId',
				'sheetRecord.trackerMessageId',
			])
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
 * Fetches modifiers for a minion.
 * Only includes minion-specific modifiers (sheetRecordId matches minion's sheetRecordId).
 * Unassigned (user-wide) modifiers are not included.
 */
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
