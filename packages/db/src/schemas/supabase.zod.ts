/**
 * Typed versions of the supazod-generated schemas with proper JSON field typing.
 *
 * The supazod generator outputs `jsonSchema` for all JSON columns, which is too
 * permissive. This file re-exports the supazod schemas with JSON fields replaced
 * by their actual typed schemas (matching Kysely naming conventions).
 */
import { z } from 'zod';
import {
	zAction as zActionRow,
	zNewAction as zNewActionRow,
	zActionUpdate as zActionUpdateRow,
	zModifier as zModifierRow,
	zNewModifier as zNewModifierRow,
	zModifierUpdate as zModifierUpdateRow,
	zMinion as zMinionRow,
	zNewMinion as zNewMinionRow,
	zMinionUpdate as zMinionUpdateRow,
	zSheetRecord as zSheetRecordRow,
	zNewSheetRecord as zNewSheetRecordRow,
	zSheetRecordUpdate as zSheetRecordUpdateRow,
	zCharacter as zCharacterRow,
	zNewCharacter as zNewCharacterRow,
	zCharacterUpdate as zCharacterUpdateRow,
	zUserSettings as zUserSettingsRow,
	zNewUserSettings as zNewUserSettingsRow,
	zUserSettingsUpdate as zUserSettingsUpdateRow,
	// Import date-containing schemas as Row versions for override
	zGame as zGameRow,
	zNewGame as zNewGameRow,
	zGameUpdate as zGameUpdateRow,
	zInitiative as zInitiativeRow,
	zNewInitiative as zNewInitiativeRow,
	zInitiativeUpdate as zInitiativeUpdateRow,
	zInitiativeActor as zInitiativeActorRow,
	zNewInitiativeActor as zNewInitiativeActorRow,
	zInitiativeActorUpdate as zInitiativeActorUpdateRow,
	zInitiativeActorGroup as zInitiativeActorGroupRow,
	zNewInitiativeActorGroup as zNewInitiativeActorGroupRow,
	zInitiativeActorGroupUpdate as zInitiativeActorGroupUpdateRow,
	zWgAuthToken as zWgAuthTokenRow,
	zNewWgAuthToken as zNewWgAuthTokenRow,
	zWgAuthTokenUpdate as zWgAuthTokenUpdateRow,
	// Re-export unchanged schemas
	zChannelDefaultCharacter,
	zNewChannelDefaultCharacter,
	zChannelDefaultCharacterUpdate,
	zGuildDefaultCharacter,
	zNewGuildDefaultCharacter,
	zGuildDefaultCharacterUpdate,
	zRollMacro,
	zNewRollMacro,
	zRollMacroUpdate,
} from './supabase.zod.generated.js';

// Import shared typed schemas for JSON fields
import { zCondition, zSheet } from './shared/index.js';
import { zRoll } from './shared/roll.zod.js';
import { SheetAdjustmentTypeEnum, zSheetAdjustment } from './shared/sheet-adjustment.zod.js';

// Import and re-export enum Zod schemas from shared source
export {
	zTrackerModeEnum,
	zImportSourceEnum,
	zInitStatsNotificationEnum,
	zRollCompactModeEnum,
	zInlineRollsDisplayEnum,
	zDefaultCompendiumEnum,
} from './lib/database-enums.js';

import {
	zTrackerModeEnum,
	zImportSourceEnum,
	zInitStatsNotificationEnum,
	zRollCompactModeEnum,
	zInlineRollsDisplayEnum,
	zDefaultCompendiumEnum,
} from './lib/database-enums.js';

// Re-export unchanged schemas
export {
	zChannelDefaultCharacter,
	zNewChannelDefaultCharacter,
	zChannelDefaultCharacterUpdate,
	zGuildDefaultCharacter,
	zNewGuildDefaultCharacter,
	zGuildDefaultCharacterUpdate,
	zRollMacro,
	zNewRollMacro,
	zRollMacroUpdate,
};

// ============================================================================
// Date coercion helper - converts strings to Date objects
// ============================================================================
const zDate = z.coerce.date();

// ============================================================================
// Game - Date fields: createdAt, lastUpdatedAt
// ============================================================================
export const zGame = zGameRow.omit({ createdAt: true, lastUpdatedAt: true }).extend({
	createdAt: zDate,
	lastUpdatedAt: zDate,
});

export const zNewGame = zNewGameRow.omit({ createdAt: true, lastUpdatedAt: true }).extend({
	createdAt: zDate.optional(),
	lastUpdatedAt: zDate.optional(),
});

export const zGameUpdate = zGameUpdateRow.omit({ createdAt: true, lastUpdatedAt: true }).extend({
	createdAt: zDate.optional(),
	lastUpdatedAt: zDate.optional(),
});

// ============================================================================
// Initiative - Date fields: createdAt, lastUpdatedAt
// ============================================================================
export const zInitiative = zInitiativeRow.omit({ createdAt: true, lastUpdatedAt: true }).extend({
	createdAt: zDate,
	lastUpdatedAt: zDate,
});

export const zNewInitiative = zNewInitiativeRow
	.omit({ createdAt: true, lastUpdatedAt: true })
	.extend({
		createdAt: zDate.optional(),
		lastUpdatedAt: zDate.optional(),
	});

export const zInitiativeUpdate = zInitiativeUpdateRow
	.omit({ createdAt: true, lastUpdatedAt: true })
	.extend({
		createdAt: zDate.optional(),
		lastUpdatedAt: zDate.optional(),
	});

// ============================================================================
// InitiativeActor - Date fields: createdAt, lastUpdatedAt
// ============================================================================
export const zInitiativeActor = zInitiativeActorRow
	.omit({ createdAt: true, lastUpdatedAt: true })
	.extend({
		createdAt: zDate,
		lastUpdatedAt: zDate,
	});

export const zNewInitiativeActor = zNewInitiativeActorRow
	.omit({ createdAt: true, lastUpdatedAt: true })
	.extend({
		createdAt: zDate.optional(),
		lastUpdatedAt: zDate.optional(),
	});

export const zInitiativeActorUpdate = zInitiativeActorUpdateRow
	.omit({ createdAt: true, lastUpdatedAt: true })
	.extend({
		createdAt: zDate.optional(),
		lastUpdatedAt: zDate.optional(),
	});

// ============================================================================
// InitiativeActorGroup - Date fields: createdAt, lastUpdatedAt
// ============================================================================
export const zInitiativeActorGroup = zInitiativeActorGroupRow
	.omit({ createdAt: true, lastUpdatedAt: true })
	.extend({
		createdAt: zDate,
		lastUpdatedAt: zDate,
	});

export const zNewInitiativeActorGroup = zNewInitiativeActorGroupRow
	.omit({ createdAt: true, lastUpdatedAt: true })
	.extend({
		createdAt: zDate.optional(),
		lastUpdatedAt: zDate.optional(),
	});

export const zInitiativeActorGroupUpdate = zInitiativeActorGroupUpdateRow
	.omit({ createdAt: true, lastUpdatedAt: true })
	.extend({
		createdAt: zDate.optional(),
		lastUpdatedAt: zDate.optional(),
	});

// ============================================================================
// WgAuthToken - Date fields: expiresAt
// ============================================================================
export const zWgAuthToken = zWgAuthTokenRow.omit({ expiresAt: true }).extend({
	expiresAt: zDate,
});

export const zNewWgAuthToken = zNewWgAuthTokenRow.omit({ expiresAt: true }).extend({
	expiresAt: zDate,
});

export const zWgAuthTokenUpdate = zWgAuthTokenUpdateRow.omit({ expiresAt: true }).extend({
	expiresAt: zDate.optional(),
});

// ============================================================================
// Action - JSON fields: rolls (Roll[]), tags (string[])
// ============================================================================
export const zAction = zActionRow.omit({ rolls: true, tags: true }).extend({
	rolls: z.array(zRoll),
	tags: z.array(z.string()),
});

export const zNewAction = zNewActionRow.omit({ rolls: true, tags: true }).extend({
	rolls: z.array(zRoll),
	tags: z.array(z.string()).optional(),
});

export const zActionUpdate = zActionUpdateRow.omit({ rolls: true, tags: true }).extend({
	rolls: z.array(zRoll).optional(),
	tags: z.array(z.string()).optional(),
});

// ============================================================================
// Modifier - JSON fields: sheetAdjustments (SheetAdjustment[])
// ============================================================================
export const zModifier = zModifierRow.omit({ sheetAdjustments: true }).extend({
	type: z.enum(SheetAdjustmentTypeEnum),
	sheetAdjustments: z.array(zSheetAdjustment),
});

export const zNewModifier = zNewModifierRow.omit({ sheetAdjustments: true }).extend({
	type: z.enum(SheetAdjustmentTypeEnum),
	sheetAdjustments: z.array(zSheetAdjustment).optional(),
});

export const zModifierUpdate = zModifierUpdateRow.omit({ sheetAdjustments: true }).extend({
	type: z.enum(SheetAdjustmentTypeEnum).optional(),
	sheetAdjustments: z.array(zSheetAdjustment).optional(),
});

// ============================================================================
// Minion - JSON fields: sheet (Sheet)
// ============================================================================
export const zMinion = zMinionRow.omit({ sheet: true }).extend({
	sheet: zSheet,
});

export const zNewMinion = zNewMinionRow.omit({ sheet: true }).extend({
	sheet: zSheet,
});

export const zMinionUpdate = zMinionUpdateRow.omit({ sheet: true }).extend({
	sheet: zSheet.optional(),
});

// ============================================================================
// SheetRecord - JSON fields: sheet (Sheet), conditions (Modifier[]), trackerMode (enum)
// ============================================================================
export const zSheetRecord = zSheetRecordRow
	.omit({ sheet: true, conditions: true, trackerMode: true })
	.extend({
		sheet: zSheet,
		conditions: z.array(zCondition),
		trackerMode: zTrackerModeEnum.nullable(),
	});

export const zNewSheetRecord = zNewSheetRecordRow
	.omit({ sheet: true, conditions: true, trackerMode: true })
	.extend({
		sheet: zSheet,
		conditions: z.array(zCondition).optional(),
		trackerMode: zTrackerModeEnum.nullable().optional(),
	});

export const zSheetRecordUpdate = zSheetRecordUpdateRow
	.omit({ sheet: true, conditions: true, trackerMode: true })
	.extend({
		sheet: zSheet.optional(),
		conditions: z.array(zCondition).optional(),
		trackerMode: zTrackerModeEnum.nullable().optional(),
	});

// ============================================================================
// Character - importSource (enum), Date fields: createdAt, lastUpdatedAt
// ============================================================================
export const zCharacter = zCharacterRow
	.omit({ importSource: true, createdAt: true, lastUpdatedAt: true })
	.extend({
		importSource: zImportSourceEnum,
		createdAt: zDate,
		lastUpdatedAt: zDate,
	});

export const zNewCharacter = zNewCharacterRow
	.omit({ importSource: true, createdAt: true, lastUpdatedAt: true })
	.extend({
		importSource: zImportSourceEnum,
		createdAt: zDate.optional(),
		lastUpdatedAt: zDate.optional(),
	});

export const zCharacterUpdate = zCharacterUpdateRow
	.omit({ importSource: true, createdAt: true, lastUpdatedAt: true })
	.extend({
		importSource: zImportSourceEnum.optional(),
		createdAt: zDate.optional(),
		lastUpdatedAt: zDate.optional(),
	});

// ============================================================================
// UserSettings - enum fields
// ============================================================================
export const zUserSettings = zUserSettingsRow
	.omit({
		defaultCompendium: true,
		initStatsNotification: true,
		inlineRollsDisplay: true,
		rollCompactMode: true,
	})
	.extend({
		defaultCompendium: zDefaultCompendiumEnum,
		initStatsNotification: zInitStatsNotificationEnum,
		inlineRollsDisplay: zInlineRollsDisplayEnum,
		rollCompactMode: zRollCompactModeEnum,
	});

export const zNewUserSettings = zNewUserSettingsRow
	.omit({
		defaultCompendium: true,
		initStatsNotification: true,
		inlineRollsDisplay: true,
		rollCompactMode: true,
	})
	.extend({
		defaultCompendium: zDefaultCompendiumEnum.optional(),
		initStatsNotification: zInitStatsNotificationEnum.optional(),
		inlineRollsDisplay: zInlineRollsDisplayEnum.optional(),
		rollCompactMode: zRollCompactModeEnum.optional(),
	});

export const zUserSettingsUpdate = zUserSettingsUpdateRow
	.omit({
		defaultCompendium: true,
		initStatsNotification: true,
		inlineRollsDisplay: true,
		rollCompactMode: true,
	})
	.extend({
		defaultCompendium: zDefaultCompendiumEnum.optional(),
		initStatsNotification: zInitStatsNotificationEnum.optional(),
		inlineRollsDisplay: zInlineRollsDisplayEnum.optional(),
		rollCompactMode: zRollCompactModeEnum.optional(),
	});
