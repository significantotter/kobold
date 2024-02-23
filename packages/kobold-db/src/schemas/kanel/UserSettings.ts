import { type InitStatsNotificationEnum, type RollCompactModeEnum, type InlineRollsDisplayEnum } from './../kanel-types.js';
import { type ColumnType, type Selectable, type Insertable, type Updateable } from 'kysely';
import { z } from 'zod';

export type UserSettingsUserId = string;

/** Represents the table public.user_settings */
export default interface UserSettingsTable {
  /** Database type: pg_catalog.text */
  userId: ColumnType<UserSettingsUserId, UserSettingsUserId, UserSettingsUserId>;

  /** Database type: pg_catalog.text */
  initStatsNotification: ColumnType<InitStatsNotificationEnum, InitStatsNotificationEnum | undefined, InitStatsNotificationEnum>;

  /** Database type: pg_catalog.text */
  rollCompactMode: ColumnType<RollCompactModeEnum, RollCompactModeEnum | undefined, RollCompactModeEnum>;

  /** Database type: pg_catalog.text */
  inlineRollsDisplay: ColumnType<InlineRollsDisplayEnum, InlineRollsDisplayEnum | undefined, InlineRollsDisplayEnum>;
}

export const userSettingsUserId = z.string();

export const zUserSettings = z.object({
  userId: userSettingsUserId,
  initStatsNotification: z.string(),
  rollCompactMode: z.string(),
  inlineRollsDisplay: z.string(),
});

export const zUserSettingsInitializer = z.object({
  userId: userSettingsUserId,
  initStatsNotification: z.string().optional(),
  rollCompactMode: z.string().optional(),
  inlineRollsDisplay: z.string().optional(),
});

export const zUserSettingsMutator = z.object({
  userId: userSettingsUserId.optional(),
  initStatsNotification: z.string().optional(),
  rollCompactMode: z.string().optional(),
  inlineRollsDisplay: z.string().optional(),
});

export type UserSettings = Selectable<UserSettingsTable>;

export type NewUserSettings = Insertable<UserSettingsTable>;

export type UserSettingsUpdate = Updateable<UserSettingsTable>;