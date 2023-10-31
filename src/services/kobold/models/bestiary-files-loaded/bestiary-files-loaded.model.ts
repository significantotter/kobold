import type { BestiaryFilesLoaded } from '../../schemas/bestiary-files-loaded.zod.js';
import { BaseModel } from '../../lib/base-model.js';
import { zBestiaryFilesLoaded } from '../../schemas/bestiary-files-loaded.zod.js';
import { ZodValidator } from '../../lib/zod-validator.js';

export interface BestiaryFilesLoadedModel extends BestiaryFilesLoaded {}
export class BestiaryFilesLoadedModel extends BaseModel {
	static get tableName(): string {
		return 'bestiaryFilesLoaded';
	}
	static createValidator() {
		return new ZodValidator();
	}

	public $z = zBestiaryFilesLoaded;
}
