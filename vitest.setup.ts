import objection from 'objection';
import { Knex } from 'knex';
import dotenv from 'dotenv';
import { beforeEach, afterAll, afterEach } from 'vitest';
dotenv.config();

const { transaction, Model } = objection;

let globalTransaction: objection.Transaction | null;
let globalKnex: Knex | null;

beforeEach(async () => {});

afterEach(async () => {});

afterAll(async () => {});
