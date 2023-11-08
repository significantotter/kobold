import { Expression, Kysely, SqlBool, sql } from 'kysely';
import { Model } from './model.js';
import { Database, Npc, NpcUpdate, NpcId, NewNpc } from '../schemas/index.js';

export class NpcModel extends Model<Database['npc']> {
	constructor(db: Kysely<Database>) {
		super(db);
	}

	public async create(args: NewNpc): Promise<Npc> {
		const result = await this.db.insertInto('npc').values(args).returningAll().execute();
		return result[0];
	}

	public async readMany({
		name,
		sourceFileName,
		limit,
		orderBy,
	}: {
		name?: string;
		sourceFileName?: string;
		limit?: number;
		orderBy?: 'random';
	}) {
		let query = this.db
			.selectFrom('npc')
			.selectAll()
			.where(({ eb, or }) => {
				const ebs = [];
				if (name != null) {
					ebs.push(eb(`name`, 'ilike', `%${name}%`));
				}
				if (sourceFileName != null) {
					ebs.push(eb(`name`, 'ilike', `%${sourceFileName}%`));
				}
				return or(ebs);
			});
		if (limit != null) {
			query = query.limit(limit);
		}
		if (orderBy != null) {
			if (orderBy === 'random') query = query.orderBy(sql`random()`);
		}
		return await query.execute();
	}

	public async read({ id }: { id: NpcId }): Promise<Npc | null> {
		const result = await this.db
			.selectFrom('npc')
			.selectAll()
			.where('npc.id', '=', id)
			.execute();
		return result[0] ?? null;
	}

	public async update({ id }: { id: NpcId }, args: NpcUpdate): Promise<Npc> {
		const result = await this.db
			.updateTable('npc')
			.set(args)
			.where('npc.id', '=', id)
			.returningAll()
			.execute();
		return result[0];
	}

	public async delete({ id }: { id: NpcId }): Promise<void> {
		await this.db.deleteFrom('npc').where('npc.id', '=', id).execute();
	}
}
