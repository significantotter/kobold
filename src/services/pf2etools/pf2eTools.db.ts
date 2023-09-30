import { drizzle } from 'drizzle-orm/better-sqlite3';
import type BetterSqlite3 from 'better-sqlite3';
import Database from 'better-sqlite3';
import * as schema from './pf2eTools.schema.js';

export const sqlite: BetterSqlite3.Database = new Database('compendium.db');
export const db = drizzle(sqlite, { schema });
