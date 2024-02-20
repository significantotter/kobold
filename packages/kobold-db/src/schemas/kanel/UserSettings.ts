import type {
  InitStatsNotificationEnum,
  RollCompactModeEnum,
  InlineRollsDisplayEnum,
} from "../kanel-types.js";
import type { ColumnType, Selectable, Insertable, Updateable } from "kysely";
import { z } from "zod";

export type UserSettingsUserId = string;

/** Represents the table public.user_settings */
export default interface UserSettingsTable {
  /** Database type: pg_catalog.text */
  userId: ColumnType<
    UserSettingsUserId,
    UserSettingsUserId,
    UserSettingsUserId | null
  >;

  /** Database type: pg_catalog.text */
  initStatsNotification: ColumnType<
    InitStatsNotificationEnum,
    InitStatsNotificationEnum | null,
    InitStatsNotificationEnum | null
  >;

  /** Database type: pg_catalog.text */
  rollCompactMode: ColumnType<
    RollCompactModeEnum,
    RollCompactModeEnum | null,
    RollCompactModeEnum | null
  >;

  /** Database type: pg_catalog.text */
  inlineRollsDisplay: ColumnType<
    InlineRollsDisplayEnum,
    InlineRollsDisplayEnum | null,
    InlineRollsDisplayEnum | null
  >;
}

export const userSettingsUserId = z.string();

export const zUserSettings = z.strictObject({
  userId: userSettingsUserId,
  initStatsNotification: z.string(),
  rollCompactMode: z.string(),
  inlineRollsDisplay: z.string(),
});

export const zUserSettingsInitializer = z.strictObject({
  userId: userSettingsUserId,
  initStatsNotification: z.string().optional(),
  rollCompactMode: z.string().optional(),
  inlineRollsDisplay: z.string().optional(),
});

export const zUserSettingsMutator = z.strictObject({
  userId: userSettingsUserId.optional(),
  initStatsNotification: z.string().optional(),
  rollCompactMode: z.string().optional(),
  inlineRollsDisplay: z.string().optional(),
});

export type UserSettings = Selectable<UserSettingsTable>;

export type NewUserSettings = Insertable<UserSettingsTable>;

export type UserSettingsUpdate = Updateable<UserSettingsTable>;
