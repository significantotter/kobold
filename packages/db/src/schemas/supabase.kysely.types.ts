import type { Database as SupabaseDatabase } from './supabase.types.js';
import { MergeDeep } from 'type-fest';
import type { KyselifyDatabase } from 'kysely-supabase';
import type {
	Roll,
	SheetAdjustment,
	Sheet,
	Condition,
	SheetAdjustmentTypeEnum,
} from './shared/index.js';
import type {
	InitStatsNotificationEnum,
	RollCompactModeEnum,
	InlineRollsDisplayEnum,
	DefaultCompendiumEnum,
	TrackerModeEnum,
	ImportSourceEnum,
} from './lib/database-enums.js';

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
							rolls: Roll[];
							description: string;
							type: string | null;
							tags?: string[];
						};
						Update: {
							rolls?: Roll[];
							tags?: string[];
						};
					};
					character: {
						Row: {
							import_source: ImportSourceEnum;
							created_at: Date;
							last_updated_at: Date;
						};
						Insert: {
							import_source: ImportSourceEnum;
							created_at?: Date;
							last_updated_at?: Date;
						};
						Update: {
							import_source?: ImportSourceEnum;
							created_at?: Date;
							last_updated_at?: Date;
						};
					};
					game: {
						Row: {
							created_at: Date;
							last_updated_at: Date;
						};
						Insert: {
							created_at?: Date;
							last_updated_at?: Date;
						};
						Update: {
							created_at?: Date;
							last_updated_at?: Date;
						};
					};
					initiative: {
						Row: {
							created_at: Date;
							last_updated_at: Date;
						};
						Insert: {
							created_at?: Date;
							last_updated_at?: Date;
						};
						Update: {
							created_at?: Date;
							last_updated_at?: Date;
						};
					};
					initiative_actor: {
						Row: {
							created_at: Date;
							last_updated_at: Date;
						};
						Insert: {
							created_at?: Date;
							last_updated_at?: Date;
						};
						Update: {
							created_at?: Date;
							last_updated_at?: Date;
						};
					};
					initiative_actor_group: {
						Row: {
							created_at: Date;
							last_updated_at: Date;
						};
						Insert: {
							created_at?: Date;
							last_updated_at?: Date;
						};
						Update: {
							created_at?: Date;
							last_updated_at?: Date;
						};
					};
					wg_auth_token: {
						Row: {
							expires_at: Date;
						};
						Insert: {
							expires_at: Date;
						};
						Update: {
							expires_at?: Date;
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
							type: SheetAdjustmentTypeEnum;
							sheet_adjustments: SheetAdjustment[];
						};
						Insert: {
							type: SheetAdjustmentTypeEnum;
							sheet_adjustments?: SheetAdjustment[];
						};
						Update: {
							type?: SheetAdjustmentTypeEnum;
							sheet_adjustments?: SheetAdjustment[];
						};
					};
					sheet_record: {
						Row: {
							conditions: Condition[];
							sheet: Sheet;
							tracker_mode: TrackerModeEnum | null;
						};
						Insert: {
							conditions?: Condition[];
							sheet: Sheet;
							tracker_mode?: TrackerModeEnum | null;
						};
						Update: {
							conditions?: Condition[];
							sheet?: Sheet;
							tracker_mode?: TrackerModeEnum | null;
						};
					};
					user_settings: {
						Row: {
							default_compendium: DefaultCompendiumEnum;
							init_stats_notification: InitStatsNotificationEnum;
							inline_rolls_display: InlineRollsDisplayEnum;
							roll_compact_mode: RollCompactModeEnum;
						};
						Insert: {
							default_compendium?: DefaultCompendiumEnum;
							init_stats_notification?: InitStatsNotificationEnum;
							inline_rolls_display?: InlineRollsDisplayEnum;
							roll_compact_mode?: RollCompactModeEnum;
						};
						Update: {
							default_compendium?: DefaultCompendiumEnum;
							init_stats_notification?: InitStatsNotificationEnum;
							inline_rolls_display?: InlineRollsDisplayEnum;
							roll_compact_mode?: RollCompactModeEnum;
						};
					};
				};
			};
		}
	>
>;

export type Database = CamelCaseDatabase<SnakeCaseDatabase>;
