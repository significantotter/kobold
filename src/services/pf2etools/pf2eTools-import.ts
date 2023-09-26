import Models from './models/index.js';
import { db } from './pf2eTools-db.js';

for (const model of Object.values(Models)) {
	const instance = new model(db);
	await instance.import();
}
