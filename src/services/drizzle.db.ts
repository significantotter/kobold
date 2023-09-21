import { NodePgDatabase, drizzle } from 'drizzle-orm/node-postgres';
import pg from 'pg';
import { schema } from '../drizzle/schema.js';

export type dbType = NodePgDatabase<schema>;

export class DrizzleDb {
	static db: dbType;
	static schema = schema;
	static isInit = false;
	static async init(connectionString: string) {
		//don't double init
		if (this.isInit) return;
		this.isInit = true;
		const client = new pg.Pool({
			connectionString,
		});

		await client.connect();
		this.db = drizzle(client, { schema });
	}
}
