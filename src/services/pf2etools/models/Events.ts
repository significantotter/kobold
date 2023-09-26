import { Neboa, Collection } from 'neboa';
import { zEventSchema, Event } from './Events.zod.js';
import { fetchOneJsonFile } from './lib/helpers.js';
import { Model } from './lib/Model.js';

export class Events extends Model<typeof zEventSchema> {
	public collection: Collection<Event>;
	constructor(private db: Neboa) {
		super();
		this.collection = this.db.collection<Event>('events');
	}
	public z = zEventSchema;
	public getFiles(): any[] {
		return [fetchOneJsonFile('events')];
	}
	public resourceListFromFile(file: any): any[] {
		return file.event ?? [];
	}
	public async import() {
		await this._importData();
	}
}
