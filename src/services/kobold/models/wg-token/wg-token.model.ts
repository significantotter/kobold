import type { WgToken as WgTokenType } from './wg-token.schema.js';
import { JSONSchema7 } from 'json-schema';
import { BaseModel } from '../../lib/base-model.js';
import WgTokenSchema from './wg-token.schema.json' assert { type: 'json' };
import Objection from 'objection';

export interface WgToken extends WgTokenType {}
export class WgToken extends BaseModel {
	static get tableName(): string {
		return 'WgAuthToken';
	}

	static get jsonSchema(): Objection.JSONSchema {
		return WgTokenSchema as Objection.JSONSchema;
	}
}
