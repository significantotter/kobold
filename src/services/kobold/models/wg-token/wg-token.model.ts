import type WgTokenTypes from './wg-token.schema';
import { JSONSchema7 } from 'json-schema';
import { BaseModel } from '../../lib/base-model';
import WgTokenSchema from './wg-token.schema.json';

export interface WgToken extends WgTokenTypes.WgToken {}
export class WgToken extends BaseModel {
	static get tableName(): string {
		return 'WgAuthToken';
	}

	static get jsonSchema(): JSONSchema7 {
		return WgTokenSchema as JSONSchema7;
	}

	static readonly factory = {};
}
