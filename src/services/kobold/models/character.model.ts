import { ExpressionBuilder, Kysely } from 'kysely';
import { Model } from './model.js';
import {
	Database,
	CharacterUpdate,
	CharacterId,
	NewCharacter,
	CharacterWithRelations,
	SheetRecord,
} from '../schemas/index.js';
import {
	channelDefaultCharacterForCharacter,
	guildDefaultCharacterForCharacter,
	sheetRecordForCharacter,
} from '../lib/shared-relation-builders.js';
import { jsonObjectFrom } from 'kysely/helpers/postgres';

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
				sheetRecordForCharacter(eb),
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
				sheetRecordForCharacter(eb),
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
		let query = this.db
			.selectFrom('character')
			.selectAll()
			.select(eb => [
				guildDefaultCharacterForCharacter(eb, { guildId }),
				channelDefaultCharacterForCharacter(eb, { channelId }),
				sheetRecordForCharacter(eb),
			]);
		if (userId) query = query.where('character.userId', '=', userId);
		if (name) query = query.where('character.name', 'ilike', `%${name}%`);

		return query.execute();
	}

	public async read(
		params: {
			name?: string;
			charId?: number;
			importSource?: string;
		} & (
			| {
					id: CharacterId;
			  }
			| {
					userId: string;
			  }
		)
	): Promise<CharacterWithRelations | null> {
		let query = this.db
			.selectFrom('character')
			.selectAll()
			.select(eb => [
				guildDefaultCharacterForCharacter(eb),
				channelDefaultCharacterForCharacter(eb),
				sheetRecordForCharacter(eb),
			]);
		if ('id' in params) query = query.where('character.id', '=', params.id);
		else {
			query = query.where('character.userId', '=', params.userId);
		}
		if (params.name) query = query.where('character.name', 'ilike', `%${params.name}%`);
		if (params.charId) {
			query = query.where('character.charId', '=', params.charId);
		}
		if (params.importSource) {
			query = query.where('character.importSource', '=', params.importSource);
		}
		return (await query.executeTakeFirst()) ?? null;
	}

	public async setIsActive({
		id,
		userId,
	}: {
		id: CharacterId;
		userId: string;
	}): Promise<CharacterWithRelations> {
		await this.db
			.updateTable('character')
			.set({ isActiveCharacter: false })
			.where('character.userId', '=', userId)
			.execute();

		const result = await this.db
			.updateTable('character')
			.set({ isActiveCharacter: true })
			.where('character.id', '=', id)
			.returningAll()
			.returning(eb => [
				guildDefaultCharacterForCharacter(eb),
				channelDefaultCharacterForCharacter(eb),
				sheetRecordForCharacter(eb),
			])
			.execute();
		return result[0];
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
				sheetRecordForCharacter(eb),
			])
			.execute();
		return result[0];
	}

	public async delete({ id }: { id: CharacterId }): Promise<void> {
		await this.db.deleteFrom('character').where('character.id', '=', id).execute();
	}
}
