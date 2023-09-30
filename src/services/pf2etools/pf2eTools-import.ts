// import { Models } from './models/index.js';
// import { db } from './pf2eTools.db.js';
// import { z } from 'zod';

// for (const model of Object.values(Models)) {
// 	const instance = new model(db);
// 	await instance.import();
// }
import { BetterSQLite3Database } from 'drizzle-orm/better-sqlite3';
import { Models } from './models/index.js';
import { db } from './pf2eTools.db.js';
import * as schema from './pf2eTools.schema.js';

export class Pf2eToolsLoader {
	constructor(private db: BetterSQLite3Database<typeof schema>) {}
	public async load() {
		for (const Model of Object.values(Models)) {
			const model = new Model(this.db);
			await model.import();
		}
	}
}

const loader = new Pf2eToolsLoader(db);
await loader.load();
