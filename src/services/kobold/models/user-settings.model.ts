import { Kysely } from 'kysely';
import {
	Database,
	NewUserSettings,
	UserSettings,
	UserSettingsUpdate,
	UserSettingsUserId,
} from '../schemas/index.js';
import { Model } from './model.js';

export class UserSettingsModel extends Model<Database['userSettings']> {
	constructor(db: Kysely<Database>) {
		super(db);
	}

	public async create(args: NewUserSettings): Promise<UserSettings> {
		const result = await this.db
			.insertInto('userSettings')
			.values(args)
			.returningAll()
			.execute();
		return result[0];
	}

	public async read({ userId }: { userId: UserSettingsUserId }): Promise<UserSettings | null> {
		const result = await this.db
			.selectFrom('userSettings')
			.selectAll()
			.where('userSettings.userId', '=', userId)
			.execute();
		return result[0] ?? null;
	}

	public async update(
		{ userId }: { userId: UserSettingsUserId },
		args: UserSettingsUpdate
	): Promise<UserSettings> {
		const result = await this.db
			.updateTable('userSettings')
			.set(args)
			.where('userSettings.userId', '=', userId)
			.returningAll()
			.execute();
		return result[0];
	}

	public async upsert(args: UserSettings): Promise<UserSettings> {
		const result = await this.db
			.insertInto('userSettings')
			.values(args)
			.onConflict(oc => oc.column('userId').doUpdateSet(args))
			.returningAll()
			.executeTakeFirstOrThrow();
		return result;
	}

	public async delete({ userId }: { userId: UserSettingsUserId }): Promise<void> {
		const result = await this.db
			.deleteFrom('userSettings')
			.where('userSettings.userId', '=', userId)
			.execute();
		if (Number(result[0].numDeletedRows) == 0) throw new Error('No rows deleted');
	}
}
