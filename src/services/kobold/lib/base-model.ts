import {
	Model,
	RelationMappings,
	PageQueryBuilder,
	QueryBuilder,
	Raw,
	Page,
	Modifiers,
} from 'objection';
import { ZodValidator } from './zod-validator.js';
import { z } from 'zod';
import _ from 'lodash';

export class BaseModel extends Model {
	static idColumn: string | string[] = 'id';

	/** Allow arbitrary properties */
	[k: string]: any;

	// enable ajv formats to  validate the date field when inserting in database
	static createValidator() {
		console.warn('creating validator');
		return new ZodValidator();
	}

	public parse() {
		return this.$z.parse(this.toJSON());
	}

	declare $z: z.ZodObject<any>;

	static get relationMappings(): RelationMappings {
		return {
			...super.relationMappings,
		};
	}
}
