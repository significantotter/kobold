import { Model, RelationMappings } from 'objection';
import { z } from 'zod';
import _ from 'lodash';
import { ZodValidator } from './zod-validator.js';

export class BaseModel extends Model {
	declare $idColumn: string | string[];

	/** Allow arbitrary properties */
	[k: string]: any;

	// enable ajv formats to  validate the date field when inserting in database
	static createValidator() {
		return new ZodValidator();
	}

	public parse() {
		return this.$z.parse(this.toJSON());
	}

	declare $z: z.ZodObject<any>;

	static relationMappings: RelationMappings = {};
	static setupRelationMappings(allModels: any) {}
}
