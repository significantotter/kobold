import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { Config } from '@kobold/config';
import * as schema from './nethys.schema.js';

const client = postgres(Config.database.url);
export const db = drizzle(client, { schema });
export const postgresClient = client;

export type NethysDb = typeof db;
