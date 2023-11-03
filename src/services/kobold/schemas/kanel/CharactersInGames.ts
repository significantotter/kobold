import type { GameId } from './Game.js';
import type { CharacterId } from './Character.js';
import type { ColumnType, Selectable, Insertable, Updateable } from 'kysely';

/** Represents the table public.characters_in_games */
export default interface charactersingamesTable {
  /** Database type: pg_catalog.int4 */
  gameId: ColumnType<GameId, GameId, GameId | null>;

  /** Database type: pg_catalog.int4 */
  characterId: ColumnType<CharacterId, CharacterId, CharacterId | null>;

  /** Database type: pg_catalog.timestamptz */
  createdAt: ColumnType<Date | null, Date | string | null, Date | string | null>;

  /** Database type: pg_catalog.timestamptz */
  lastUpdatedAt: ColumnType<Date | null, Date | string | null, Date | string | null>;
}

export type charactersingames = Selectable<charactersingamesTable>;

export type Newcharactersingames = Insertable<charactersingamesTable>;

export type charactersingamesUpdate = Updateable<charactersingamesTable>;