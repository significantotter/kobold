import { drizzle } from 'drizzle-orm/better-sqlite3';
import type BetterSqlite3 from 'better-sqlite3';
import Database from 'better-sqlite3';
import * as schema from './pf2eTools.schema.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);

export const sqlite: BetterSqlite3.Database = new Database(
	path.join(path.dirname(__filename), '..', 'compendium.db')
);
export const db = drizzle(sqlite, { schema });
