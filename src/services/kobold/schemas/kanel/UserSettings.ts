import type { ColumnType, Selectable, Insertable, Updateable } from 'kysely';

export type UserSettingsUserId = string;

/** Represents the table public.user_settings */
export default interface UserSettingsTable {
  /** Database type: pg_catalog.text */
  userId: ColumnType<UserSettingsUserId, UserSettingsUserId, UserSettingsUserId | null>;

  /** Database type: pg_catalog.text */
  initStatsNotification: ColumnType<string, string | null, string | null>;

  /** Database type: pg_catalog.text */
  rollCompactMode: ColumnType<string, string | null, string | null>;

  /** Database type: pg_catalog.text */
  inlineRollsDisplay: ColumnType<string, string | null, string | null>;
}

export type UserSettings = Selectable<UserSettingsTable>;

export type NewUserSettings = Insertable<UserSettingsTable>;

export type UserSettingsUpdate = Updateable<UserSettingsTable>;