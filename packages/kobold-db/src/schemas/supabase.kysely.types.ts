import type { Database as SupabaseDatabase } from './supabase.types.js';
import { MergeDeep } from 'type-fest';
import type { KyselifyDatabase } from 'kysely-supabase';
import type { Roll, SheetAdjustment, Sheet } from './shared/index.js';
import { zModifier } from './supabase.zod.js';
import z from 'zod';
// avoiding a circular dependency by defining this type here instead of in db-types.ts where it would normally go
type Modifier = z.infer<typeof zModifier>;

/**
 * Type utility to convert a snake_case string to camelCase
 */
type SnakeToCamelCase<S extends string> = S extends `${infer Head}_${infer Tail}`
	? `${Lowercase<Head>}${Capitalize<SnakeToCamelCase<Tail>>}`
	: Lowercase<S>;

/**
 * Type utility to check if a type is a Kysely ColumnType
 * ColumnType has __select__, __insert__, __update__ branded keys
 */
type IsColumnType<T> = T extends { readonly __select__: unknown } ? true : false;

/**
 * Type utility to convert all keys of an object from snake_case to camelCase
 * Preserves Kysely ColumnType without recursing into its internal structure
 */
type CamelCaseKeys<T> =
	T extends Array<infer U>
		? Array<CamelCaseKeys<U>>
		: IsColumnType<T> extends true
			? T // Preserve ColumnType as-is
			: T extends object
				? {
						[K in keyof T as K extends string ? SnakeToCamelCase<K> : K]: CamelCaseKeys<
							T[K]
						>;
					}
				: T;

/**
 * Transforms a Kysely database type to use camelCase table and column names
 * This is useful when using Kysely's CamelCasePlugin
 */
export type CamelCaseDatabase<DB> = {
	[TableName in keyof DB as TableName extends string
		? SnakeToCamelCase<TableName>
		: TableName]: CamelCaseKeys<DB[TableName]>;
};

type SnakeCaseDatabase = KyselifyDatabase<
	MergeDeep<
		SupabaseDatabase,
		{
			public: {
				Tables: {
					action: {
						Row: {
							rolls: Roll[];
							tags: string[];
						};
						Insert: {
							rolls?: Roll[];
							tags?: string[];
						};
						Update: {
							rolls?: Roll[];
							tags?: string[];
						};
					};
					minion: {
						Row: {
							sheet: Sheet;
						};
						Insert: {
							sheet: Sheet;
						};
						Update: {
							sheet?: Sheet;
						};
					};
					modifier: {
						Row: {
							roll_target_tags: string[];
							sheet_adjustments: SheetAdjustment[];
						};
						Insert: {
							roll_target_tags?: string[];
							sheet_adjustments?: SheetAdjustment[];
						};
						Update: {
							roll_target_tags?: string[];
							sheet_adjustments?: SheetAdjustment[];
						};
					};
					sheet_record: {
						Row: {
							conditions: Modifier[];
							sheet: Sheet;
						};
						Insert: {
							conditions?: Modifier[];
							sheet: Sheet;
						};
						Update: {
							conditions?: Modifier[];
							sheet?: Sheet;
						};
					};
				};
			};
		}
	>
>;

export type Database = CamelCaseDatabase<SnakeCaseDatabase>;
