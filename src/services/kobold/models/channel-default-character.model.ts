import { Kysely } from 'kysely';
import { Model } from './model.js';
import {
	Database,
	ChannelDefaultCharacter,
	ChannelDefaultCharacterUpdate,
	ChannelDefaultCharacterUserId,
	NewChannelDefaultCharacter,
} from '../schemas/index.js';

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
		let query = await this.db.selectFrom('channelDefaultCharacter').selectAll();
		if (userId) query = query.where('channelDefaultCharacter.userId', '=', userId);
		if (channelId) query = query.where('channelDefaultCharacter.channelId', '=', channelId);
		if (characterId)
			query = query.where('channelDefaultCharacter.characterId', '=', characterId);
		const result = await query.execute();
		return result[0] ?? null;
	}

	public async update(
		{ userId }: { userId: ChannelDefaultCharacterUserId },
		args: ChannelDefaultCharacterUpdate
	): Promise<ChannelDefaultCharacter> {
		const result = await this.db
			.updateTable('channelDefaultCharacter')
			.set(args)
			.where('channelDefaultCharacter.userId', '=', userId)
			.returningAll()
			.execute();
		return result[0];
	}

	public async delete({ userId }: { userId: ChannelDefaultCharacterUserId }): Promise<void> {
		await this.db
			.deleteFrom('channelDefaultCharacter')
			.where('channelDefaultCharacter.userId', '=', userId)
			.execute();
	}
}
