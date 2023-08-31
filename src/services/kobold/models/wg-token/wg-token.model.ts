import type { WgToken as WgTokenType } from './wg-token.schema.js';
import { JSONSchema7 } from 'json-schema';
import { BaseModel } from '../../lib/base-model.js';
import WgTokenSchema from './wg-token.schema.json' assert { type: 'json' };

export interface WgToken extends WgTokenType {}
export class WgToken extends BaseModel {
	static get tableName(): string {
		return 'WgAuthToken';
	}

	static get jsonSchema(): JSONSchema7 {
		return WgTokenSchema as JSONSchema7;
	}
}
