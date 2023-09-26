import { Neboa, Collection } from 'neboa';
import { fetchOneJsonFile } from './lib/helpers.js';
import { Model } from './lib/Model.js';
import { zRenderDemoSchema, RenderDemo } from './RenderDemo.zod.js';

export class RenderDemos extends Model<typeof zRenderDemoSchema> {
	public collection: Collection<RenderDemo>;
	constructor(private db: Neboa) {
		super();
		this.collection = this.db.collection<RenderDemo>('renderDemos');
	}
	public z = zRenderDemoSchema;
	public getFiles(): any[] {
		return [fetchOneJsonFile('renderDemos')];
	}
	public resourceListFromFile(file: any): any[] {
		return file.renderDemo;
	}
	public async import() {
		await this._importData();
	}
}
