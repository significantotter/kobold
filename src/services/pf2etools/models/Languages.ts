import { Neboa, Collection } from 'neboa';
import { fetchOneJsonFile } from './lib/helpers.js';
import { Model } from './lib/Model.js';
import { Language, zLanguageSchema } from './Languages.zod.js';

export class Languages extends Model<typeof zLanguageSchema> {
	public collection: Collection<Language>;
	constructor(private db: Neboa) {
		super();
		this.collection = this.db.collection<Language>('languages');
	}
	public z = zLanguageSchema;
	public getFiles(): any[] {
		return [fetchOneJsonFile('languages')];
	}
	public resourceListFromFile(file: any): any[] {
		return file.language;
	}
	public async import() {
		await this._importData();
	}
}
