import type GameTypes from './game.schema.js';
import { JSONSchema7 } from 'json-schema';
import { BaseModel } from '../../lib/base-model.js';
import GameSchema from './game.schema.json';
import { Model, RelationMappings } from 'objection';

export interface Game extends GameTypes.Game {}
export class Game extends BaseModel {
	static get tableName(): string {
		return 'game';
	}

	static get jsonSchema(): JSONSchema7 {
		return GameSchema as JSONSchema7;
	}

	static get relationMappings(): RelationMappings {
		return {};
	}
}
