import { Column, SQL, SQLWrapper, sql } from 'drizzle-orm';

export class DrizzleUtils {
	public static escapeWildcards(value: string): string {
		return `'${value.replace(/([\_\%])/g, '')}'`;
	}
	// Compares two strings, ignoring case and allowing wildcards
	public static ilike(column: Column, value: string | SQLWrapper, escape?: string): SQL {
		if (escape) return sql`upper(${column}) like upper(${value}) escape ${escape}`;
		return sql`upper(${column}) like upper(${value})`;
	}
}
