import { Model, RelationMappings, AjvValidator } from 'objection';
import { ZodValidator } from './zod-validator.js';
import { z } from 'zod';
export class BaseModel extends Model {
	static idColumn: string | string[] = 'id';

	/** Allow arbitrary properties */
	[k: string]: any;

	// enable ajv formats to  validate the date field when inserting in database
	static createValidator() {
		return new ZodValidator();
	}

	public $z: z.ZodTypeAny = z.any();

	static get relationMappings(): RelationMappings {
		return {
			...super.relationMappings,
		};
	}
}
