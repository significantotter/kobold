import { Kysely } from 'kysely';
import {
	GuildDefaultCharacter,
	GuildDefaultCharacterUpdate,
	GuildDefaultCharacterUserId,
	Database,
	NewGuildDefaultCharacter,
} from '../schemas/index.js';
import { Model } from './model.js';

export class GuildDefaultCharacterModel extends Model<Database['guildDefaultCharacter']> {
	constructor(db: Kysely<Database>) {
		super(db);
	}

	public async create(args: NewGuildDefaultCharacter): Promise<GuildDefaultCharacter> {
		const result = await this.db
			.insertInto('guildDefaultCharacter')
			.values(args)
			.returningAll()
			.execute();
		return result[0];
	}

	public async read({
		userId,
		guildId,
		characterId,
	}: {
		userId?: GuildDefaultCharacterUserId;
		guildId?: string;
		characterId?: number;
	}): Promise<GuildDefaultCharacter | null> {
		let query = this.db.selectFrom('guildDefaultCharacter').selectAll();
		if (userId) query = query.where('guildDefaultCharacter.userId', '=', userId);
		if (guildId) query = query.where('guildDefaultCharacter.guildId', '=', guildId);
		if (characterId) query = query.where('guildDefaultCharacter.characterId', '=', characterId);
		const result = await query.execute();
		return result[0] ?? null;
	}

	public async update(
		{
			userId,
			guildId,
		}: {
			userId: GuildDefaultCharacterUserId;
			guildId: string;
		},
		args: GuildDefaultCharacterUpdate
	): Promise<GuildDefaultCharacter> {
		let query = this.db
			.updateTable('guildDefaultCharacter')
			.set(args)
			.where('guildDefaultCharacter.userId', '=', userId);

		if (userId) query = query.where('guildDefaultCharacter.userId', '=', userId);
		if (guildId) query = query.where('guildDefaultCharacter.guildId', '=', guildId);

		const result = await query.returningAll().executeTakeFirstOrThrow();
		return result;
	}

	public async delete({
		userId,
		guildId,
	}: {
		userId: GuildDefaultCharacterUserId;
		guildId: string;
	}): Promise<void> {
		let query = this.db.deleteFrom('guildDefaultCharacter');

		if (userId) query = query.where('guildDefaultCharacter.userId', '=', userId);
		if (guildId) query = query.where('guildDefaultCharacter.guildId', '=', guildId);

		const result = await query.execute();
		if (Number(result[0].numDeletedRows) == 0) throw new Error('No rows deleted');
	}
}
