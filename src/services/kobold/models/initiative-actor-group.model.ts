import { Kysely } from 'kysely';
import { Model } from './model.js';
import {
	Database,
	InitiativeActorGroup,
	InitiativeActorGroupUpdate,
	InitiativeActorGroupId,
	NewInitiativeActorGroup,
} from '../schemas/index.js';

export class InitiativeActorGroupModel extends Model<Database['initiativeActorGroup']> {
	constructor(db: Kysely<Database>) {
		super(db);
	}

	public async create(args: NewInitiativeActorGroup): Promise<InitiativeActorGroup> {
		const result = await this.db
			.insertInto('initiativeActorGroup')
			.values(args)
			.returningAll()
			.execute();
		return result[0];
	}

	public async read({
		id,
	}: {
		id: InitiativeActorGroupId;
	}): Promise<InitiativeActorGroup | null> {
		const result = await this.db
			.selectFrom('initiativeActorGroup')
			.selectAll()
			.where('initiativeActorGroup.id', '=', id)
			.execute();
		return result[0] ?? null;
	}

	public async update(
		{ id }: { id: InitiativeActorGroupId },
		args: InitiativeActorGroupUpdate
	): Promise<InitiativeActorGroup> {
		const result = await this.db
			.updateTable('initiativeActorGroup')
			.set(args)
			.where('initiativeActorGroup.id', '=', id)
			.returningAll()
			.execute();
		return result[0];
	}

	public async delete({ id }: { id: InitiativeActorGroupId }): Promise<void> {
		await this.db
			.deleteFrom('initiativeActorGroup')
			.where('initiativeActorGroup.id', '=', id)
			.execute();
	}
}
