import { Kysely } from 'kysely';
import {
	ChannelDefaultCharacter,
	ChannelDefaultCharacterUpdate,
	ChannelDefaultCharacterUserId,
	Database,
	NewChannelDefaultCharacter,
} from '../schemas/index.js';
import { Model } from './model.js';

export class ChannelDefaultCharacterModel extends Model<Database['channelDefaultCharacter']> {
	constructor(db: Kysely<Database>) {
		super(db);
	}

	public async create(args: NewChannelDefaultCharacter): Promise<ChannelDefaultCharacter> {
		const result = await this.db
			.insertInto('channelDefaultCharacter')
			.values(args)
			.returningAll()
			.execute();
		return result[0];
	}

	public async read({
		userId,
		channelId,
		characterId,
	}: {
		userId?: ChannelDefaultCharacterUserId;
		channelId?: string;
		characterId?: number;
	}): Promise<ChannelDefaultCharacter | null> {
		let query = this.db.selectFrom('channelDefaultCharacter').selectAll();
		if (userId !== undefined)
			query = query.where('channelDefaultCharacter.userId', '=', userId);
		if (channelId !== undefined)
			query = query.where('channelDefaultCharacter.channelId', '=', channelId);
		if (characterId !== undefined)
			query = query.where('channelDefaultCharacter.characterId', '=', characterId);
		const result = await query.execute();
		return result[0] ?? null;
	}

	public async update(
		{
			userId,
			channelId,
		}: {
			userId: ChannelDefaultCharacterUserId;
			channelId: string;
		},
		args: ChannelDefaultCharacterUpdate
	): Promise<ChannelDefaultCharacter> {
		let query = this.db
			.updateTable('channelDefaultCharacter')
			.set(args)
			.where('channelDefaultCharacter.userId', '=', userId);

		if (userId !== undefined)
			query = query.where('channelDefaultCharacter.userId', '=', userId);
		if (channelId !== undefined)
			query = query.where('channelDefaultCharacter.channelId', '=', channelId);

		const result = await query.returningAll().executeTakeFirstOrThrow();
		return result;
	}

	public async delete({
		userId,
		channelId,
	}: {
		userId: ChannelDefaultCharacterUserId;
		channelId: string;
	}): Promise<void> {
		let query = this.db.deleteFrom('channelDefaultCharacter');

		if (userId !== undefined)
			query = query.where('channelDefaultCharacter.userId', '=', userId);
		if (channelId !== undefined)
			query = query.where('channelDefaultCharacter.channelId', '=', channelId);

		const result = await query.execute();
		if (Number(result[0].numDeletedRows) == 0) throw new Error('No rows deleted');
	}

	public async deleteIfExists(args: {
		userId: ChannelDefaultCharacterUserId;
		channelId: string;
	}): Promise<void> {
		{
			try {
				return await this.delete(args);
			} catch (err) {
				if (err instanceof Error && err.message.toLowerCase() === 'no rows deleted') {
					return;
				}
				throw err;
			}
		}
	}
}
