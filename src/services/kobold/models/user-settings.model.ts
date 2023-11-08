import { Kysely } from 'kysely';
import { Model } from './model.js';
import {
	Database,
	UserSettings,
	UserSettingsUpdate,
	UserSettingsUserId,
	NewUserSettings,
} from '../schemas/index.js';

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

	public async delete({ userId }: { userId: UserSettingsUserId }): Promise<void> {
		await this.db
			.deleteFrom('userSettings')
			.where('userSettings.userId', '=', userId)
			.execute();
	}
}
