import objection, { Transaction } from 'objection';
import dotenv from 'dotenv';
import { DBModel } from './src/services/db-model.js';
import { beforeAll, beforeEach, afterAll, afterEach } from 'vitest';
dotenv.config();

const { transaction, Model } = objection;

console.log(process.env.DATABASE_TEST_URL);
DBModel.init(process.env.DATABASE_TEST_URL as string);
const knex = DBModel.knex;
let globalTransaction: objection.Transaction | null;
let globalKnex: objection.Knex | null;

beforeEach(async () => {
	globalTransaction = await transaction.start(knex);
	Model.knex(globalTransaction);
});

afterEach(async () => {
	if (globalTransaction) await globalTransaction.rollback();
	Model.knex(knex);
});

afterAll(async () => {
	knex.destroy();
});
