import type { BestiaryFilesLoaded as BestiaryFilesLoadedType } from './bestiary-files-loaded.schema.js';
import { JSONSchema7 } from 'json-schema';
import { BaseModel } from '../../lib/base-model.js';
import BestiaryFilesLoadedSchema from './bestiary-files-loaded.schema.json' assert { type: 'json' };

export interface BestiaryFilesLoaded extends BestiaryFilesLoadedType {}
export class BestiaryFilesLoaded extends BaseModel {
	static get tableName(): string {
		return 'bestiaryFilesLoaded';
	}

	static get jsonSchema(): JSONSchema7 {
		return BestiaryFilesLoadedSchema as JSONSchema7;
	}
}
