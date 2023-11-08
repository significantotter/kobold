import { Kysely } from 'kysely';
import { Model } from './model.js';
import {
	Database,
	Character,
	CharacterUpdate,
	CharacterId,
	NewCharacter,
	CharacterWithRelations,
} from '../schemas/index.js';
import {
	channelDefaultCharacterForCharacter,
	guildDefaultCharacterForCharacter,
} from '../lib/shared-relation-builders.js';

export class CharacterModel extends Model<Database['character']> {
	constructor(db: Kysely<Database>) {
		super(db);
	}

	public async create(args: NewCharacter): Promise<CharacterWithRelations> {
		const result = await this.db
			.insertInto('character')
			.values(args)
			.returningAll()
			.returning(eb => [
				guildDefaultCharacterForCharacter(eb),
				channelDefaultCharacterForCharacter(eb),
			])
			.execute();
		return result[0];
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
		const result = await this.db
			.selectFrom('character')
			.selectAll('character')
			.select(eb => [
				guildDefaultCharacterForCharacter(eb, { guildId }),
				channelDefaultCharacterForCharacter(eb, { channelId }),
			])
			.where('character.userId', '=', userId)
			.execute();
		const activeCharacter = result.filter(character => character.isActiveCharacter);
		if (activeCharacter.length) return activeCharacter[0];
		const guildDefaultCharacter = result.filter(
			character => character.guildDefaultCharacters.length
		);
		if (guildDefaultCharacter.length) return guildDefaultCharacter[0];
		const channelDefaultCharacter = result.filter(
			character => character.channelDefaultCharacters.length
		);
		if (channelDefaultCharacter.length) return channelDefaultCharacter[0];
		return null;
	}

	public async readMany({
		userId,
		guildId,
		channelId,
	}: {
		userId?: string;
		guildId?: string;
		channelId?: string;
	}): Promise<CharacterWithRelations[]> {
		let query = await this.db
			.selectFrom('character')
			.selectAll()
			.select(eb => [
				guildDefaultCharacterForCharacter(eb, { guildId }),
				channelDefaultCharacterForCharacter(eb, { channelId }),
			]);
		if (userId) query = query.where('character.userId', '=', userId);

		return await query.execute();
	}

	public async read({ id }: { id: CharacterId }): Promise<CharacterWithRelations | null> {
		const result = await this.db
			.selectFrom('character')
			.selectAll()
			.select(eb => [
				guildDefaultCharacterForCharacter(eb),
				channelDefaultCharacterForCharacter(eb),
			])
			.where('character.id', '=', id)
			.execute();
		return result[0] ?? null;
	}

	public async update(
		{ id }: { id: CharacterId },
		args: CharacterUpdate
	): Promise<CharacterWithRelations> {
		const result = await this.db
			.updateTable('character')
			.set(args)
			.where('character.id', '=', id)
			.returningAll()
			.returning(eb => [
				guildDefaultCharacterForCharacter(eb),
				channelDefaultCharacterForCharacter(eb),
			])
			.execute();
		return result[0];
	}

	public async delete({ id }: { id: CharacterId }): Promise<void> {
		await this.db.deleteFrom('character').where('character.id', '=', id).execute();
	}
}
