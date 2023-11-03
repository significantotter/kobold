import type { ColumnType, Selectable, Insertable, Updateable } from 'kysely';

export type WgAuthTokenId = number;

/** Represents the table public.wg_auth_token */
export default interface WgAuthTokenTable {
  /** Database type: pg_catalog.int4 */
  id: ColumnType<WgAuthTokenId, WgAuthTokenId | null, WgAuthTokenId | null>;

  /** Database type: pg_catalog.int4 */
  charId: ColumnType<number, number, number | null>;

  /** Database type: pg_catalog.text */
  accessToken: ColumnType<string, string, string | null>;

  /** Database type: pg_catalog.timestamp */
  expiresAt: ColumnType<Date, Date | string, Date | string | null>;

  /** Database type: pg_catalog.text */
  accessRights: ColumnType<string, string, string | null>;

  /** Database type: pg_catalog.text */
  tokenType: ColumnType<string, string, string | null>;
}

export type WgAuthToken = Selectable<WgAuthTokenTable>;

export type NewWgAuthToken = Insertable<WgAuthTokenTable>;

export type WgAuthTokenUpdate = Updateable<WgAuthTokenTable>;