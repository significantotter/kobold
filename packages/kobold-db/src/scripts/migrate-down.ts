import * as path from 'path';
import pg from 'pg';
import { promises as fs } from 'fs';
import { Kysely, Migrator, PostgresDialect, FileMigrationProvider } from 'kysely';
import { fileURLToPath } from 'url';
import { Config } from 'kobold-config';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function migrateDown() {
	const db = new Kysely<any>({
		dialect: new PostgresDialect({
			pool: new pg.Pool({ connectionString: Config.database.url }),
		}),
	});

	const migrator = new Migrator({
		db,
		provider: new FileMigrationProvider({
			fs,
			path,
			// This needs to be an absolute path.
			migrationFolder: path.join(__dirname, './../migrations'),
		}),
	});

	const { error, results } = await migrator.migrateDown();

	results?.forEach(it => {
		if (it.status === 'Success') {
			console.log(`migration "${it.migrationName}" was executed successfully`);
		} else if (it.status === 'Error') {
			console.error(`failed to execute migration "${it.migrationName}"`);
		}
	});

	if (error) {
		console.error('failed to migrate');
		console.error(error);
		process.exit(1);
	}

	await db.destroy();
}

migrateDown();
