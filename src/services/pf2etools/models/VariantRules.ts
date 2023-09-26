import { Neboa, Collection } from 'neboa';
import { fetchOneJsonFile } from './lib/helpers.js';
import { Model } from './lib/Model.js';
import { zVariantRuleSchema, VariantRule } from './VariantRules.zod.js';

export class VariantRules extends Model<typeof zVariantRuleSchema> {
	public collection: Collection<VariantRule>;
	constructor(private db: Neboa) {
		super();
		this.collection = this.db.collection<VariantRule>('variantRules');
	}
	public z = zVariantRuleSchema;
	public getFiles(): any[] {
		return [fetchOneJsonFile('variantRules')];
	}
	public resourceListFromFile(file: any): any[] {
		return file.variantrule;
	}
	public async import() {
		await this._importData();
	}
}
