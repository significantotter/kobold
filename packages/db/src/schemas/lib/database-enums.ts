/**
 * Database enum types and Zod schemas for enum columns.
 * These are shared between Kysely types and Zod validation schemas.
 */
import { z } from 'zod';

// ============================================================================
// Tracker Mode / Sheet Style Enum
// ============================================================================
export enum TrackerModeEnum {
	counters_only = 'counters_only',
	basic_stats = 'basic_stats',
	full_sheet = 'full_sheet',
}
export const zTrackerModeEnum = z.nativeEnum(TrackerModeEnum);

// ============================================================================
// Import Source Enum
// ============================================================================
export enum ImportSourceEnum {
	wg = 'wg',
	pathbuilder = 'pathbuilder',
	pastebin = 'pastebin',
	wanderers_guide = 'wanderers-guide',
}
export const zImportSourceEnum = z.nativeEnum(ImportSourceEnum);

// ============================================================================
// Init Stats Notification Enum
// ============================================================================
export enum InitStatsNotificationEnum {
	never = 'never',
	every_turn = 'every_turn',
	every_round = 'every_round',
	whenever_hidden = 'whenever_hidden',
}
export const zInitStatsNotificationEnum = z.nativeEnum(InitStatsNotificationEnum);

// ============================================================================
// Roll Compact Mode Enum
// ============================================================================
export enum RollCompactModeEnum {
	normal = 'normal',
	compact = 'compact',
}
export const zRollCompactModeEnum = z.nativeEnum(RollCompactModeEnum);

// ============================================================================
// Inline Rolls Display Enum
// ============================================================================
export enum InlineRollsDisplayEnum {
	detailed = 'detailed',
	compact = 'compact',
}
export const zInlineRollsDisplayEnum = z.nativeEnum(InlineRollsDisplayEnum);

// ============================================================================
// Default Compendium Enum
// ============================================================================
export enum DefaultCompendiumEnum {
	nethys = 'nethys',
	pf2etools = 'pf2etools',
}
export const zDefaultCompendiumEnum = z.nativeEnum(DefaultCompendiumEnum);

// ============================================================================
// Game System Enum
// ============================================================================
export enum GameSystemEnum {
	pf2e = 'pf2e',
	sf2e = 'sf2e',
}
export const zGameSystemEnum = z.nativeEnum(GameSystemEnum);
