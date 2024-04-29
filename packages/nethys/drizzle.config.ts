import type { Config } from 'drizzle-kit';
import { Config as KoboldConfig } from '@kobold/config';
console.error(KoboldConfig.database.url);
export default {
	schema: './src/nethys.schema.ts',
	out: './drizzle',
	driver: 'pg',
	dbCredentials: {
		connectionString: KoboldConfig.database.url,
	},
	tablesFilter: ['nethys_*'],
} satisfies Config;
