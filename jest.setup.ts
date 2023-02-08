import objection from 'objection';
import dotenv from 'dotenv';
import { DBModel } from './src/services/db-model.js';
dotenv.config();

DBModel.init(process.env.DATABASE_TEST_URL as string);
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
