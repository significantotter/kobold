import { zWgToken, type WgToken } from '../../schemas/wg-token.zod.js';
import { BaseModel } from '../../lib/base-model.js';
import { ZodValidator } from '../../lib/zod-validator.js';

export interface WgTokenModel extends WgToken {}
export class WgTokenModel extends BaseModel {
	public $idColumn = ['id'];
	static get tableName(): string {
		return 'WgAuthToken';
	}

	static createValidator() {
		return new ZodValidator();
	}

	public $z = zWgToken;

	static setupRelationMappings({}: {}) {
		this.relationMappings = {};
	}
}
