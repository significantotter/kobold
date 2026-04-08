import { Kysely, sql } from 'kysely';
import {
	channelDefaultCharacterForCharacter,
	guildDefaultCharacterForCharacter,
} from '../lib/shared-relation-builders.js';
import {
	Action,
	Character,
	ChannelDefaultCharacter,
	CharacterBasic,
	CharacterId,
	CharacterUpdate,
	CharacterWithRelations,
	Database,
	Game,
	GuildDefaultCharacter,
	Modifier,
	NewCharacter,
	RollMacro,
	SheetRecord,
} from '../schemas/index.js';
import { Model } from './model.js';
import { ImportSourceEnum } from '../schemas/lib/database-enums.js';

export class CharacterModel extends Model<Database['character']> {
	constructor(db: Kysely<Database>) {
		super(db);
	}

	/**
	 * @deprecated Do not call — exists only to satisfy the base Model contract.
	 * Use {@link createReturningId} instead.
	 */
	public async create(_args: NewCharacter): Promise<Character> {
		throw new Error(
			'CharacterModel.create() must not be called. Use createReturningId() instead.'
		);
	}

	/**
	 * Inserts a character row and returns only the generated id.
	 * Avoids the expensive relation subqueries that the base create() would require.
	 */
	public async createReturningId(args: NewCharacter): Promise<{ id: CharacterId }> {
		const result = await this.db
			.insertInto('character')
			.values(args)
			.returning('character.id')
			.executeTakeFirstOrThrow();
		return result;
	}

	public async readActive({
		userId,
		guildId,
		channelId,
	}: {
		userId: string;
		guildId?: string;
		channelId?: string;
	}): Promise<CharacterWithRelations | null> {
		const result = await this._readManyParallel({ userId, guildId, channelId });
		const channelDefault = result.filter(c => c.channelDefaultCharacters.length);
		if (channelDefault.length) return channelDefault[0];
		const guildDefault = result.filter(c => c.guildDefaultCharacters.length);
		if (guildDefault.length) return guildDefault[0];
		const active = result.filter(c => c.isActiveCharacter);
		if (active.length) return active[0];
		return null;
	}

	/**
	 * Same active-character resolution as readActive() but returns only basic columns.
	 * Uses a single query with LEFT JOINs and priority ordering:
	 *   1. channel default  2. guild default  3. isActiveCharacter
	 */
	public async readActiveLite({
		userId,
		guildId,
		channelId,
	}: {
		userId: string;
		guildId?: string;
		channelId?: string;
	}): Promise<CharacterBasic | null> {
		let query = this.db
			.selectFrom('character')
			.$if(!!channelId, qb =>
				qb.leftJoin('channelDefaultCharacter', join =>
					join
						.onRef('channelDefaultCharacter.characterId', '=', 'character.id')
						.on('channelDefaultCharacter.channelId', '=', channelId!)
				)
			)
			.$if(!!guildId, qb =>
				qb.leftJoin('guildDefaultCharacter', join =>
					join
						.onRef('guildDefaultCharacter.characterId', '=', 'character.id')
						.on('guildDefaultCharacter.guildId', '=', guildId!)
				)
			)
			.select([
				'character.id',
				'character.name',
				'character.userId',
				'character.sheetRecordId',
				'character.isActiveCharacter',
				'character.importSource',
				'character.charId',
			])
			.where('character.userId', '=', userId)
			.where(eb =>
				eb.or([
					...(channelId
						? [sql<boolean>`"channelDefaultCharacter"."characterId" IS NOT NULL`]
						: []),
					...(guildId
						? [sql<boolean>`"guildDefaultCharacter"."characterId" IS NOT NULL`]
						: []),
					eb('character.isActiveCharacter', '=', true),
				])
			)
			.orderBy(
				sql`CASE
					${channelId ? sql`WHEN "channelDefaultCharacter"."characterId" IS NOT NULL THEN 0` : sql``}
					${guildId ? sql`WHEN "guildDefaultCharacter"."characterId" IS NOT NULL THEN 1` : sql``}
					ELSE 2
				END`,
				'asc'
			)
			.limit(1);

		return (await query.executeTakeFirst()) ?? null;
	}

	/**
	 * Reads characters without loading any relations — returns only basic columns.
	 * Use for autocomplete, listings, and anywhere full sheet data isn't needed.
	 */
	public readManyLite({
		userId,
		name,
		exactName,
		importSource,
		channelId,
		guildId,
		isActive,
	}: {
		userId?: string;
		name?: string;
		exactName?: string;
		importSource?: ImportSourceEnum;
		channelId?: string;
		guildId?: string;
		isActive?: boolean;
	}): Promise<CharacterBasic[]> {
		let query = this.db
			.selectFrom('character')
			.select([
				'character.id',
				'character.name',
				'character.userId',
				'character.sheetRecordId',
				'character.isActiveCharacter',
				'character.importSource',
				'character.charId',
			]);
		if (userId !== undefined) query = query.where('character.userId', '=', userId);
		if (exactName !== undefined) query = query.where('character.name', 'ilike', exactName);
		else if (name !== undefined) query = query.where('character.name', 'ilike', `%${name}%`);
		if (importSource !== undefined)
			query = query.where('character.importSource', '=', importSource);
		if (isActive !== undefined)
			query = query.where('character.isActiveCharacter', '=', isActive);
		if (channelId !== undefined)
			query = query.where(eb =>
				eb.exists(
					eb
						.selectFrom('channelDefaultCharacter')
						.whereRef('channelDefaultCharacter.characterId', '=', 'character.id')
						.where('channelDefaultCharacter.channelId', '=', channelId)
						.select(eb.lit(1).as('one'))
				)
			);
		if (guildId !== undefined)
			query = query.where(eb =>
				eb.exists(
					eb
						.selectFrom('guildDefaultCharacter')
						.whereRef('guildDefaultCharacter.characterId', '=', 'character.id')
						.where('guildDefaultCharacter.guildId', '=', guildId)
						.select(eb.lit(1).as('one'))
				)
			);
		return query.execute();
	}

	/**
	 * Reads characters with only their modifiers loaded — no sheet, actions, rollMacros, or other relations.
	 * Much lighter than readMany() when only modifier data is needed (e.g. autocomplete).
	 */
	public async readManyWithModifiers({
		userId,
	}: {
		userId: string;
	}): Promise<(CharacterBasic & { modifiers: Modifier[] })[]> {
		const characters = await this.readManyLite({ userId });
		if (characters.length === 0) return [];

		const sheetRecordIds = [...new Set(characters.map(c => c.sheetRecordId))];
		const modifiers = (await this.db
			.selectFrom('modifier')
			.selectAll('modifier')
			.where('modifier.sheetRecordId', 'in', sheetRecordIds)
			.execute()) as Modifier[];

		const modifiersMap = new Map<number, Modifier[]>();
		for (const m of modifiers) {
			if (m.sheetRecordId != null) {
				const arr = modifiersMap.get(m.sheetRecordId) ?? [];
				arr.push(m);
				modifiersMap.set(m.sheetRecordId, arr);
			}
		}

		return characters.map(c => ({
			...c,
			modifiers: modifiersMap.get(c.sheetRecordId) ?? [],
		}));
	}

	public readMany({
		userId,
		guildId,
		channelId,
		name,
	}: {
		userId?: string;
		guildId?: string;
		channelId?: string;
		name?: string;
	}): Promise<CharacterWithRelations[]> {
		return this._readManyParallel({ userId, guildId, channelId, name });
	}

	/**
	 * Fetches characters and all their relations via parallel queries instead of
	 * correlated JSON subqueries.  This keeps individual query payloads small and
	 * lets Postgres execute the relation queries concurrently.
	 */
	private async _readManyParallel({
		id,
		userId,
		guildId,
		channelId,
		name,
		charId,
		importSource,
	}: {
		id?: CharacterId;
		userId?: string;
		guildId?: string;
		channelId?: string;
		name?: string;
		charId?: number;
		importSource?: ImportSourceEnum;
	}): Promise<CharacterWithRelations[]> {
		// 1. Fetch base character rows (lightweight, no relations)
		let baseQuery = this.db.selectFrom('character').selectAll('character');
		if (id !== undefined) baseQuery = baseQuery.where('character.id', '=', id);
		if (userId !== undefined) baseQuery = baseQuery.where('character.userId', '=', userId);
		if (name !== undefined) baseQuery = baseQuery.where('character.name', 'ilike', `%${name}%`);
		if (charId !== undefined) baseQuery = baseQuery.where('character.charId', '=', charId);
		if (importSource !== undefined)
			baseQuery = baseQuery.where('character.importSource', '=', importSource);
		const characters = await baseQuery.execute();

		if (characters.length === 0) return [];

		const characterIds = characters.map(c => c.id);
		const sheetRecordIds = [...new Set(characters.map(c => c.sheetRecordId))];
		const userIds = [...new Set(characters.map(c => c.userId))];
		const gameIds = [...new Set(characters.filter(c => c.gameId != null).map(c => c.gameId!))];

		// 2. Fire all relation queries in parallel
		const [
			sheetRecords,
			actions,
			modifiers,
			rollMacros,
			channelDefaults,
			guildDefaults,
			games,
		] = await Promise.all([
			// SheetRecord (excluding adjustedSheet for write-path consistency)
			this.db
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
				.where('sheetRecord.id', 'in', sheetRecordIds)
				.execute() as Promise<SheetRecord[]>,

			// Actions: character-specific OR user-wide (sheetRecordId IS NULL)
			this.db
				.selectFrom('action')
				.selectAll('action')
				.where(eb =>
					eb.or([
						eb('action.sheetRecordId', 'in', sheetRecordIds),
						eb.and([
							eb('action.sheetRecordId', 'is', null),
							eb('action.userId', 'in', userIds),
						]),
					])
				)
				.execute() as Promise<Action[]>,

			// Modifiers: character-specific only
			this.db
				.selectFrom('modifier')
				.selectAll('modifier')
				.where('modifier.sheetRecordId', 'in', sheetRecordIds)
				.execute() as Promise<Modifier[]>,

			// RollMacros: character-specific OR user-wide (sheetRecordId IS NULL)
			this.db
				.selectFrom('rollMacro')
				.selectAll('rollMacro')
				.where(eb =>
					eb.or([
						eb('rollMacro.sheetRecordId', 'in', sheetRecordIds),
						eb.and([
							eb('rollMacro.sheetRecordId', 'is', null),
							eb('rollMacro.userId', 'in', userIds),
						]),
					])
				)
				.execute() as Promise<RollMacro[]>,

			// ChannelDefaultCharacters
			channelId
				? this.db
						.selectFrom('channelDefaultCharacter')
						.selectAll('channelDefaultCharacter')
						.where('channelDefaultCharacter.characterId', 'in', characterIds)
						.where('channelDefaultCharacter.channelId', '=', channelId)
						.execute()
				: (Promise.resolve([]) as Promise<ChannelDefaultCharacter[]>),

			// GuildDefaultCharacters
			guildId
				? this.db
						.selectFrom('guildDefaultCharacter')
						.selectAll('guildDefaultCharacter')
						.where('guildDefaultCharacter.characterId', 'in', characterIds)
						.where('guildDefaultCharacter.guildId', '=', guildId)
						.execute()
				: (Promise.resolve([]) as Promise<GuildDefaultCharacter[]>),

			// Games
			gameIds.length > 0
				? (this.db
						.selectFrom('game')
						.selectAll('game')
						.where('game.id', 'in', gameIds)
						.execute() as Promise<Game[]>)
				: (Promise.resolve([]) as Promise<Game[]>),
		]);

		// 3. Index relation results for O(1) lookups
		const sheetRecordMap = new Map(sheetRecords.map(sr => [sr.id, sr]));
		const gameMap = new Map(games.map(g => [g.id, g]));
		const channelDefaultMap = new Map<number, ChannelDefaultCharacter[]>();
		for (const cd of channelDefaults) {
			const arr = channelDefaultMap.get(cd.characterId) ?? [];
			arr.push(cd);
			channelDefaultMap.set(cd.characterId, arr);
		}
		const guildDefaultMap = new Map<number, GuildDefaultCharacter[]>();
		for (const gd of guildDefaults) {
			const arr = guildDefaultMap.get(gd.characterId) ?? [];
			arr.push(gd);
			guildDefaultMap.set(gd.characterId, arr);
		}

		// Index actions, modifiers, rollMacros by sheetRecordId
		const actionsMap = new Map<number, Action[]>();
		const userWideActions = new Map<string, Action[]>();
		for (const a of actions) {
			if (a.sheetRecordId != null) {
				const arr = actionsMap.get(a.sheetRecordId) ?? [];
				arr.push(a);
				actionsMap.set(a.sheetRecordId, arr);
			} else {
				const arr = userWideActions.get(a.userId) ?? [];
				arr.push(a);
				userWideActions.set(a.userId, arr);
			}
		}
		const modifiersMap = new Map<number, Modifier[]>();
		for (const m of modifiers) {
			if (m.sheetRecordId != null) {
				const arr = modifiersMap.get(m.sheetRecordId) ?? [];
				arr.push(m);
				modifiersMap.set(m.sheetRecordId, arr);
			}
		}
		const rollMacrosMap = new Map<number, RollMacro[]>();
		const userWideRollMacros = new Map<string, RollMacro[]>();
		for (const rm of rollMacros) {
			if (rm.sheetRecordId != null) {
				const arr = rollMacrosMap.get(rm.sheetRecordId) ?? [];
				arr.push(rm);
				rollMacrosMap.set(rm.sheetRecordId, arr);
			} else {
				const arr = userWideRollMacros.get(rm.userId) ?? [];
				arr.push(rm);
				userWideRollMacros.set(rm.userId, arr);
			}
		}

		// 4. Assemble CharacterWithRelations
		return characters.map(c => ({
			...c,
			channelDefaultCharacters: channelDefaultMap.get(c.id) ?? [],
			guildDefaultCharacters: guildDefaultMap.get(c.id) ?? [],
			sheetRecord: sheetRecordMap.get(c.sheetRecordId)!,
			game: c.gameId != null ? (gameMap.get(c.gameId) ?? null) : null,
			actions: [
				...(actionsMap.get(c.sheetRecordId) ?? []),
				...(userWideActions.get(c.userId) ?? []),
			],
			modifiers: modifiersMap.get(c.sheetRecordId) ?? [],
			rollMacros: [
				...(rollMacrosMap.get(c.sheetRecordId) ?? []),
				...(userWideRollMacros.get(c.userId) ?? []),
			],
		}));
	}

	public async read(
		params: {
			name?: string;
			charId?: number;
			importSource?: ImportSourceEnum;
		} & (
			| {
					id: CharacterId;
			  }
			| {
					userId: string;
			  }
		)
	): Promise<CharacterWithRelations | null> {
		const result = await this._readManyParallel({
			id: 'id' in params ? params.id : undefined,
			userId: 'userId' in params ? params.userId : undefined,
			name: params.name,
			charId: params.charId,
			importSource: params.importSource,
		});
		return result[0] ?? null;
	}

	public async setIsActive({ id, userId }: { id: CharacterId; userId: string }): Promise<void> {
		await this.db.transaction().execute(async trx => {
			await trx
				.updateTable('character')
				.set({ isActiveCharacter: false })
				.where('character.userId', '=', userId)
				.execute();

			await trx
				.updateTable('character')
				.set({ isActiveCharacter: true })
				.where('character.id', '=', id)
				.execute();
		});
	}

	/**
	 * @deprecated Do not call — exists only to satisfy the base Model contract.
	 * Use {@link updateFields} instead.
	 */
	public async update(_target: { id: CharacterId }, _args: CharacterUpdate): Promise<Character> {
		throw new Error('CharacterModel.update() must not be called. Use updateFields() instead.');
	}

	/**
	 * Updates character columns without returning the full row or any relations.
	 * Callers already know the values they supplied and can use them directly.
	 */
	public async updateFields({ id }: { id: CharacterId }, args: CharacterUpdate): Promise<void> {
		await this.db.updateTable('character').set(args).where('character.id', '=', id).execute();
	}

	/**
	 * Reads a single character without loading relations.
	 * Accepts the same flexible filters as read() but returns only basic columns.
	 * Much faster than read() when you only need basic character info.
	 */
	public async readLite(
		params: {
			name?: string;
			exactName?: string;
			charId?: number;
			importSource?: ImportSourceEnum;
		} & ({ id: CharacterId; userId?: string } | { userId: string })
	): Promise<CharacterBasic | null> {
		let query = this.db
			.selectFrom('character')
			.select([
				'character.id',
				'character.name',
				'character.userId',
				'character.sheetRecordId',
				'character.isActiveCharacter',
				'character.importSource',
				'character.charId',
			]);
		if ('id' in params && params.id !== undefined) {
			query = query.where('character.id', '=', params.id);
		}
		if (params.userId !== undefined) {
			query = query.where('character.userId', '=', params.userId);
		}
		if (params.exactName !== undefined) {
			query = query.where('character.name', 'ilike', params.exactName);
		} else if (params.name !== undefined) {
			query = query.where('character.name', 'ilike', `%${params.name}%`);
		}
		if (params.charId !== undefined) {
			query = query.where('character.charId', '=', params.charId);
		}
		if (params.importSource !== undefined) {
			query = query.where('character.importSource', '=', params.importSource);
		}
		return (await query.orderBy('character.id', 'asc').executeTakeFirst()) ?? null;
	}

	public async delete({ id }: { id: CharacterId }): Promise<void> {
		const result = await this.db
			.deleteFrom('character')
			.where('character.id', '=', id)
			.execute();
		if (Number(result[0].numDeletedRows) == 0) throw new Error('No rows deleted');
	}
}
