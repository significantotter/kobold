import { Neboa, Collection } from 'neboa';
import { fetchOneJsonFile } from './lib/helpers.js';
import { Model } from './lib/Model.js';
import { zTableSchema, Table } from './Tables.zod.js';

export class Tables extends Model<typeof zTableSchema> {
	public collection: Collection<Table>;
	constructor(private db: Neboa) {
		super();
		this.collection = this.db.collection<Table>('tables');
	}
	public z = zTableSchema;
	public getFiles(): any[] {
		return [fetchOneJsonFile('tables')];
	}
	public resourceListFromFile(file: any): any[] {
		return file.table;
	}
	public async import() {
		await this._importData();
	}
}
