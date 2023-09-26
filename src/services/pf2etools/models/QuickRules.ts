import { Neboa, Collection } from 'neboa';
import { fetchOneJsonFile } from './lib/helpers.js';
import { Model } from './lib/Model.js';
import { zQuickRuleSchema, QuickRule } from './QuickRules.zod.js';
import { z } from 'zod';

export class QuickRules extends Model<typeof zQuickRuleSchema> {
	public collection: Collection<QuickRule>;
	constructor(private db: Neboa) {
		super();
		this.collection = this.db.collection<QuickRule>('quickRules');
	}
	public z = zQuickRuleSchema;
	public getFiles(): any[] {
		return [fetchOneJsonFile('quickRules')];
	}
	public resourceListFromFile(file: any): any[] {
		return file.quickRule;
	}
	public async import() {
		//truncate the existing entries
		const ids = await this.collection.query().find();
		await this.collection.deleteMany(ids.map(id => id._id));

		const jsonFiles = await this.getFiles();

		for (const jsonFile of jsonFiles) {
			const quickRules = jsonFile.quickRules;
			for (const quickRule in quickRules) {
				console.log(quickRule);
				const parse = this.z.safeParse({ [quickRule]: quickRules[quickRule] });
				if (!parse.success) {
					console.dir(parse.error.format(), { depth: null });
					console.dir({ [quickRule]: quickRules[quickRule] }, { depth: null });
					throw new Error();
				}
				await this.collection.insert(parse.data);
			}
		}
	}
}
