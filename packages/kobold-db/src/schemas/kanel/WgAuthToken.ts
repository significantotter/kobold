import { type ColumnType, type Selectable, type Insertable, type Updateable } from 'kysely';
import { z } from 'zod';

export type WgAuthTokenId = number;

/** Represents the table public.wg_auth_token */
export default interface WgAuthTokenTable {
  /** Database type: pg_catalog.int4 */
  id: ColumnType<WgAuthTokenId, WgAuthTokenId | undefined, WgAuthTokenId>;

  /** Database type: pg_catalog.int4 */
  charId: ColumnType<number, number, number>;

  /** Database type: pg_catalog.text */
  accessToken: ColumnType<string, string, string>;

  /** Database type: pg_catalog.timestamp */
  expiresAt: ColumnType<Date, Date | string, Date | string>;

  /** Database type: pg_catalog.text */
  accessRights: ColumnType<string, string, string>;

  /** Database type: pg_catalog.text */
  tokenType: ColumnType<string, string, string>;
}

export const wgAuthTokenId = z.number().int().max(2147483647);

export const zWgAuthToken = z.object({
  id: wgAuthTokenId,
  charId: z.number().int().max(2147483647),
  accessToken: z.string(),
  expiresAt: z.date(),
  accessRights: z.string(),
  tokenType: z.string(),
});

export const zWgAuthTokenInitializer = z.object({
  id: wgAuthTokenId.optional(),
  charId: z.number().int().max(2147483647),
  accessToken: z.string(),
  expiresAt: z.date(),
  accessRights: z.string(),
  tokenType: z.string(),
});

export const zWgAuthTokenMutator = z.object({
  id: wgAuthTokenId.optional(),
  charId: z.number().int().max(2147483647).optional(),
  accessToken: z.string().optional(),
  expiresAt: z.date().optional(),
  accessRights: z.string().optional(),
  tokenType: z.string().optional(),
});

export type WgAuthToken = Selectable<WgAuthTokenTable>;

export type NewWgAuthToken = Insertable<WgAuthTokenTable>;

export type WgAuthTokenUpdate = Updateable<WgAuthTokenTable>;