import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';

export const sqlite = new Database('pf2eTools.db');
export const db = drizzle(sqlite);
