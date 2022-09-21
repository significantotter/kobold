import objection from 'objection';
import { DBModel } from './src/services/db-model.js';
import Config from './src/config/config.json';

DBModel.init(Config.database.testUrl);
const knex = DBModel.knex;

const { transaction, Model } = objection;

global.beforeAll(async () => {
	global.knex = knex;
	global.txn = null;
});

global.beforeEach(async () => {
	global.txn = await transaction.start(knex);
	Model.knex(global.txn);
});

global.afterEach(async () => {
	await global.txn.rollback();
	Model.knex(knex);
});

global.afterAll(async () => {
	global.knex.destroy();
});
