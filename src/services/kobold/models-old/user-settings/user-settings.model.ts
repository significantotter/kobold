import type { UserSettings } from '../../schemas/zod-tables/user-settings.zod.js';
import { BaseModel } from '../../lib/base-model.js';
import { zUserSettings } from '../../schemas/zod-tables/user-settings.zod.js';
import { ZodValidator } from '../../lib/zod-validator.js';

export interface UserSettingsModel extends UserSettings {}
export class UserSettingsModel extends BaseModel {
	static idColumn = ['userId'];
	public $insertIgnore = [];

	static get tableName(): string {
		return 'userSettings';
	}

	static createValidator() {
		return new ZodValidator();
	}

	public $z = zUserSettings;

	static setupRelationMappings({}: {}) {
		this.relationMappings = {};
	}
}
