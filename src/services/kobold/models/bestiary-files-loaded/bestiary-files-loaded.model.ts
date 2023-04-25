import type BestiaryFilesLoadedTypes from './bestiary-files-loaded.schema';
import { JSONSchema7 } from 'json-schema';
import { BaseModel } from '../../lib/base-model.js';
import BestiaryFilesLoadedSchema from './bestiary-files-loaded.schema.json';

export interface BestiaryFilesLoaded extends BestiaryFilesLoadedTypes.BestiaryFilesLoaded {}
export class BestiaryFilesLoaded extends BaseModel {
	static get tableName(): string {
		return 'bestiaryFilesLoaded';
	}

	static get jsonSchema(): JSONSchema7 {
		return BestiaryFilesLoadedSchema as JSONSchema7;
	}
}
