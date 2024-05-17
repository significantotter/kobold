import type { Config } from 'drizzle-kit';

export default {
	schema: './src/pf2eTools.schema.ts',
	out: './drizzle',
	driver: 'better-sqlite',
	dbCredentials: {
		url: 'compendium.db',
	},
} satisfies Config;
