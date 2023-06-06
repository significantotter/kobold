import { Model, RelationMappings, AjvValidator } from 'objection';
import addFormats from 'ajv-formats';
export class BaseModel extends Model {
	static idColumn: string | string[] = 'id';

	/** Allow arbitrary properties */
	[k: string]: any;

	// enable ajv formats to  validate the date field when inserting in database
	static createValidator() {
		return new AjvValidator({
			onCreateAjv: ajv => {
				addFormats(ajv);
			},
			options: {
				allErrors: true,
				validateSchema: true,
				ownProperties: true,
				allowUnionTypes: true,
			},
		});
	}

	/** Fields that are required to insert a row */
	static requiredFields: string[] = [];

	static get relationMappings(): RelationMappings {
		return {
			...super.relationMappings,
		};
	}

	/** Returns the resourceType for the model class */
	static get resourceType() {
		return this.jsonSchema.title;
	}

	/** Returns the "resourceType" of the model instance. */
	get modelName() {
		const Subclass = <typeof BaseModel>this.constructor;
		return Subclass.resourceType;
	}
}
