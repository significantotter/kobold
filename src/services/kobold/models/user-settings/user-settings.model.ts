import type UserSettingsTypes from './user-settings.schema.js';
import { JSONSchema7 } from 'json-schema';
import { BaseModel } from '../../lib/base-model.js';
import UserSettingsSchema from './user-settings.schema.json';

export interface UserSettings extends UserSettingsTypes.UserSettings {}
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
