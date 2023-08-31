import type { UserSettings as UserSettingsType } from './user-settings.schema.js';
import { JSONSchema7 } from 'json-schema';
import { BaseModel } from '../../lib/base-model.js';
import UserSettingsSchema from './user-settings.schema.json' assert { type: 'json' };

export interface UserSettings extends UserSettingsType {}
export class UserSettings extends BaseModel {
	static get idColumn() {
		return ['userId'];
	}

	static get tableName(): string {
		return 'userSettings';
	}

	static get jsonSchema(): JSONSchema7 {
		return UserSettingsSchema as JSONSchema7;
	}
}
