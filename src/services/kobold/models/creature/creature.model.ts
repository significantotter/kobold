import type CreatureTypes from './creature.schema';
import { JSONSchema7 } from 'json-schema';
import { BaseModel } from '../../lib/base-model.js';
import creature from './creature.schema.json';

export interface Creature extends CreatureTypes.Creature {}
export class Creature extends BaseModel {
	static get tableName(): string {
		return 'creature';
	}

	static get jsonSchema(): JSONSchema7 {
		return creature as JSONSchema7;
	}
}
