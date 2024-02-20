import { RawBuilder, sql } from 'kysely';

/**
 * The node-pg driver automatically treats all array value parameters as postgres arrays
 * In order to serialize JSONB arrays, we have to prepare it into a string-like value first
 */
export function sqlJSON<T>(object: T): RawBuilder<T> {
	return sql`(${JSON.stringify(object)}::jsonb)`;
}
