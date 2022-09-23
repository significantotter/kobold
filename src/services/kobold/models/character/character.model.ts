import type CharacterTypes from './character.schema.js';
import { JSONSchema7 } from 'json-schema';
import { BaseModel } from '../../lib/base-model.js';
import CharacterSchema from './character.schema.json';

export interface Character extends CharacterTypes.Character {}
export class Character extends BaseModel {
	static get tableName(): string {
		return 'character';
	}

	static get jsonSchema(): JSONSchema7 {
		return CharacterSchema as JSONSchema7;
	}
}
