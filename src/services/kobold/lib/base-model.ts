import { Model, RelationMappings } from 'objection';
export class BaseModel extends Model {
	static idColumn = 'id';

	/** Allow arbitrary properties */
	[k: string]: any;

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
