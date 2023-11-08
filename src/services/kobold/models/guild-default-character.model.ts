import { Kysely } from 'kysely';
import { Model } from './model.js';
import {
	Database,
	GuildDefaultCharacter,
	GuildDefaultCharacterUpdate,
	NewGuildDefaultCharacter,
	GuildDefaultCharacterGuildId,
	GuildDefaultCharacterUserId,
} from '../schemas/index.js';

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
	}: {
		userId: GuildDefaultCharacterUserId;
		guildId: GuildDefaultCharacterGuildId;
	}): Promise<GuildDefaultCharacter | null> {
		const result = await this.db
			.selectFrom('guildDefaultCharacter')
			.selectAll()
			.where('guildDefaultCharacter.userId', '=', userId)
			.where('guildDefaultCharacter.guildId', '=', guildId)
			.execute();
		return result[0] ?? null;
	}

	public async update(
		{
			userId,
			guildId,
		}: {
			userId: GuildDefaultCharacterUserId;
			guildId: GuildDefaultCharacterGuildId;
		},
		args: GuildDefaultCharacterUpdate
	): Promise<GuildDefaultCharacter> {
		const result = await this.db
			.updateTable('guildDefaultCharacter')
			.set(args)
			.where('guildDefaultCharacter.userId', '=', userId)
			.where('guildDefaultCharacter.guildId', '=', guildId)
			.returningAll()
			.execute();
		return result[0];
	}

	public async delete({
		userId,
		guildId,
	}: {
		userId: GuildDefaultCharacterUserId;
		guildId: GuildDefaultCharacterGuildId;
	}): Promise<void> {
		await this.db
			.deleteFrom('guildDefaultCharacter')
			.where('guildDefaultCharacter.userId', '=', userId)
			.where('guildDefaultCharacter.guildId', '=', guildId)
			.execute();
	}
}
