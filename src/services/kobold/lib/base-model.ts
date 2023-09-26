import { Model, RelationMappings, AjvValidator } from 'objection';
import { z } from 'zod';
import _ from 'lodash';
import addFormats from 'ajv-formats';

export class BaseModel extends Model {
	static idColumn: string | string[] = 'id';

	/** Allow arbitrary properties */
	[k: string]: any;

	// enable ajv formats to  validate the date field when inserting in database
	static createValidator() {
		return new AjvValidator({
			onCreateAjv: ajv => {
				addFormats.default(ajv);
			},
			options: {
				allErrors: true,
				validateSchema: true,
				ownProperties: true,
				allowUnionTypes: true,
			},
		});
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
