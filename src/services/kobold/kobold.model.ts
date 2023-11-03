import { CamelCasePlugin, Kysely, PostgresDialect } from 'kysely';
import Database from './schemas/kanel/Database.js';

export class kobold {
	public db: Kysely<Database>;
	constructor(dialect: PostgresDialect) {
		this.db = new Kysely<Database>({
			dialect,
			plugins: [new CamelCasePlugin({ maintainNestedObjectKeys: true })],
		});
	}
}
