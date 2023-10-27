import type { Config } from 'drizzle-kit';
import * as dotenv from 'dotenv';
dotenv.config();

export default {
	schema: './src/drizzle/schema.ts',
	out: './src/drizzle',
	driver: 'pg',
	dbCredentials: {
		connectionString: process.env.DATABASE_URL ?? '',
	},
} satisfies Config;
