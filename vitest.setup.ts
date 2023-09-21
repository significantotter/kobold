import objection from 'objection';
import { Knex } from 'knex';
import dotenv from 'dotenv';
import { DBModel } from './src/services/db-model.js';
import { DrizzleDb } from './src/services/drizzle.db.js';
import { beforeEach, afterAll, afterEach } from 'vitest';
dotenv.config();

const { transaction, Model } = objection;

DBModel.init(process.env.DATABASE_TEST_URL as string);
await DrizzleDb.init(process.env.DATABASE_TEST_URL as string);

const knex = DBModel.knex;
let globalTransaction: objection.Transaction | null;
let globalKnex: Knex | null;

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
