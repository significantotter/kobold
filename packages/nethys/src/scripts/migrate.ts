import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import { Config } from '@kobold/config';
import postgres from 'postgres';

const sql = postgres(Config.database.url, { max: 1 });
const db = drizzle(sql);

await migrate(db, { migrationsFolder: 'drizzle' });

await sql.end();
