import { Pojo, Validator, ValidatorArgs } from 'objection';
import { BaseModel } from './base-model.js';

export class ZodValidator extends Validator {
	validate(args: ValidatorArgs): Pojo {
		// The model instance. May be empty at this point.
		const model = args.model as BaseModel;

		// The properties to validate. After validation these values will
		// be merged into `model` by objection.
		const json = args.json;

		// `ModelOptions` object. If your custom validator sets default
		// values or has the concept of required properties, you need to
		// check the `opt.patch` boolean. If it is true we are validating
		// a patch object (an object with a subset of model's properties).
		const opt = args.options;

		// A context object shared between the validation methods. A new
		// object is created for each validation operation. You can store
		// whatever you need in this object.
		const ctx = args.ctx;

		// Do your validation here and throw any exception if the
		// validation fails.
		const parsedJSON = model.$z.safeParse(json);

		// You need to return the (possibly modified) json.
		return json;
	}

	beforeValidate(args: ValidatorArgs) {
		// Takes the same arguments as `validate`. Usually there is no need
		// to override this.
		return super.beforeValidate(args);
	}

	afterValidate(args: ValidatorArgs) {
		// Takes the same arguments as `validate`. Usually there is no need
		// to override this.
		return super.afterValidate(args);
	}
}
