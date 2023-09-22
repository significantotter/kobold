// import { drizzle, BetterSQLite3Database } from 'drizzle-orm/better-sqlite3';
// import Database from 'better-sqlite3';
// import type BetterSqlite3 from 'better-sqlite3';
// import models from './models/index.js';

// export class Pf2eToolsLoader {
// 	private sqlite: BetterSqlite3.Database;
// 	private db: BetterSQLite3Database;
// 	constructor() {
// 		const db = new Database('pf2eTools.db');
// 		this.sqlite = db;
// 		this.db = drizzle(this.sqlite);
// 	}
// 	public async load() {
// 		for (let model of Object.values(models)) {
// 			await model.import();
// 		}
// 	}
// 	public async checkHash() {}
// }

// const loader = new Pf2eToolsLoader();
// await loader.load();
