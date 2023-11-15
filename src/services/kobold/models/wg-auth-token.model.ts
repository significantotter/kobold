import { Kysely } from 'kysely';
import {
	Database,
	NewWgAuthToken,
	WgAuthToken,
	WgAuthTokenId,
	WgAuthTokenUpdate,
} from '../schemas/index.js';
import { Model } from './model.js';

export class WgAuthTokenModel extends Model<Database['wgAuthToken']> {
	constructor(db: Kysely<Database>) {
		super(db);
	}

	public async create(args: NewWgAuthToken): Promise<WgAuthToken> {
		const result = await this.db
			.insertInto('wgAuthToken')
			.values(args)
			.returningAll()
			.execute();
		return result[0];
	}

	public async read({
		id,
		charId,
	}: {
		id?: WgAuthTokenId;
		charId?: number;
	}): Promise<WgAuthToken | null> {
		let query = this.db.selectFrom('wgAuthToken').selectAll();

		if (id) query = query.where('wgAuthToken.id', '=', id);
		if (charId) query = query.where('wgAuthToken.charId', '=', charId);

		const result = await query.orderBy('expiresAt desc').executeTakeFirst();

		return result ?? null;
	}

	public async update(
		{
			id,
			charId,
		}: {
			id?: WgAuthTokenId;
			charId?: number;
		},
		args: WgAuthTokenUpdate
	): Promise<WgAuthToken> {
		let query = this.db.updateTable('wgAuthToken').set(args);

		if (id != null) query = query.where('wgAuthToken.id', '=', id);
		if (charId != null) query = query.where('wgAuthToken.charId', '=', charId);

		const result = await query.returningAll().execute();
		return result[0];
	}

	public async delete({ id, charId }: { id?: WgAuthTokenId; charId?: number }): Promise<void> {
		let query = this.db.deleteFrom('wgAuthToken');

		if (id != null) query = query.where('wgAuthToken.id', '=', id);
		if (charId != null) query = query.where('wgAuthToken.charId', '=', charId);

		await query.execute();
	}
}
