import type { BestiaryFilesLoaded as BestiaryFilesLoadedType } from './bestiary-files-loaded.schema.js';
import { JSONSchema7 } from 'json-schema';
import { BaseModel } from '../../lib/base-model.js';
import BestiaryFilesLoadedSchema from './bestiary-files-loaded.schema.json' assert { type: 'json' };
import Objection from 'objection';
import { removeRequired } from '../../lib/helpers.js';

export interface BestiaryFilesLoaded extends BestiaryFilesLoadedType {}
export class BestiaryFilesLoaded extends BaseModel {
	static get tableName(): string {
		return 'bestiaryFilesLoaded';
	}

	static get jsonSchema(): Objection.JSONSchema {
		return removeRequired(BestiaryFilesLoadedSchema as unknown as Objection.JSONSchema);
	}
}
