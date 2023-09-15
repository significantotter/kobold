import { drizzle, BetterSQLite3Database } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import models from './models/index.js';

export class Pf2eToolsLoader {
	private sqlite: Database;
	private db: BetterSQLite3Database;
	constructor() {
		this.sqlite = new Database('pf2eTools.db');
		this.db = drizzle(this.sqlite);
	}
	public async load() {
		for (let model of Object.values(models)) {
			await model.import();
		}
	}
	public async checkHash() {}
}

const loader = new Pf2eToolsLoader();
await loader.load();
