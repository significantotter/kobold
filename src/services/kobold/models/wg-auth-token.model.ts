import { Kysely } from 'kysely';
import { Model } from './model.js';
import {
	Database,
	WgAuthToken,
	WgAuthTokenUpdate,
	WgAuthTokenId,
	NewWgAuthToken,
} from '../schemas/index.js';

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

	public async read({ id }: { id: WgAuthTokenId }): Promise<WgAuthToken | null> {
		const result = await this.db
			.selectFrom('wgAuthToken')
			.selectAll()
			.where('wgAuthToken.id', '=', id)
			.execute();
		return result[0] ?? null;
	}

	public async update(
		{ id }: { id: WgAuthTokenId },
		args: WgAuthTokenUpdate
	): Promise<WgAuthToken> {
		const result = await this.db
			.updateTable('wgAuthToken')
			.set(args)
			.where('wgAuthToken.id', '=', id)
			.returningAll()
			.execute();
		return result[0];
	}

	public async delete({ id }: { id: WgAuthTokenId }): Promise<void> {
		await this.db.deleteFrom('wgAuthToken').where('wgAuthToken.id', '=', id).execute();
	}
}
