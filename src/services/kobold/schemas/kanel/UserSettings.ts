import type { ColumnType, Selectable, Insertable, Updateable } from 'kysely';

export type UserSettingsUserId = string;

/** Represents the table public.user_settings */
export default interface usersettingsTable {
  /** Database type: pg_catalog.varchar */
  userId: ColumnType<UserSettingsUserId, UserSettingsUserId, UserSettingsUserId | null>;

  /** Database type: pg_catalog.text */
  initStatsNotification: ColumnType<string | null, string | null, string | null>;

  /** Database type: pg_catalog.text */
  rollCompactMode: ColumnType<string | null, string | null, string | null>;

  /** Database type: pg_catalog.text */
  inlineRollsDisplay: ColumnType<string | null, string | null, string | null>;
}

export type usersettings = Selectable<usersettingsTable>;

export type Newusersettings = Insertable<usersettingsTable>;

export type usersettingsUpdate = Updateable<usersettingsTable>;