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
	// Re-export unchanged schemas
	zCharacter,
	zNewCharacter,
	zCharacterUpdate,
	zChannelDefaultCharacter,
	zNewChannelDefaultCharacter,
	zChannelDefaultCharacterUpdate,
	zGame,
	zNewGame,
	zGameUpdate,
	zGuildDefaultCharacter,
	zNewGuildDefaultCharacter,
	zGuildDefaultCharacterUpdate,
	zInitiative,
	zNewInitiative,
	zInitiativeUpdate,
	zInitiativeActor,
	zNewInitiativeActor,
	zInitiativeActorUpdate,
	zInitiativeActorGroup,
	zNewInitiativeActorGroup,
	zInitiativeActorGroupUpdate,
	zUserSettings,
	zNewUserSettings,
	zUserSettingsUpdate,
	zWgAuthToken,
	zNewWgAuthToken,
	zWgAuthTokenUpdate,
	zRollMacro,
	zNewRollMacro,
	zRollMacroUpdate,
} from './supabase.zod.generated.js';

// Import shared typed schemas for JSON fields
import { zSheet } from './shared/index.js';
import { zRoll } from './shared/roll.zod.js';
import { zSheetAdjustment } from './shared/sheet-adjustment.zod.js';

// Re-export unchanged schemas
export {
	zCharacter,
	zNewCharacter,
	zCharacterUpdate,
	zChannelDefaultCharacter,
	zNewChannelDefaultCharacter,
	zChannelDefaultCharacterUpdate,
	zGame,
	zNewGame,
	zGameUpdate,
	zGuildDefaultCharacter,
	zNewGuildDefaultCharacter,
	zGuildDefaultCharacterUpdate,
	zInitiative,
	zNewInitiative,
	zInitiativeUpdate,
	zInitiativeActor,
	zNewInitiativeActor,
	zInitiativeActorUpdate,
	zInitiativeActorGroup,
	zNewInitiativeActorGroup,
	zInitiativeActorGroupUpdate,
	zUserSettings,
	zNewUserSettings,
	zUserSettingsUpdate,
	zWgAuthToken,
	zNewWgAuthToken,
	zWgAuthTokenUpdate,
	zRollMacro,
	zNewRollMacro,
	zRollMacroUpdate,
};

// ============================================================================
// Action - JSON fields: rolls (Roll[]), tags (string[])
// ============================================================================
export const zAction = zActionRow.omit({ rolls: true, tags: true }).extend({
	rolls: z.array(zRoll),
	tags: z.array(z.string()),
});

export const zNewAction = zNewActionRow.omit({ rolls: true, tags: true }).extend({
	rolls: z.array(zRoll).optional(),
	tags: z.array(z.string()).optional(),
});

export const zActionUpdate = zActionUpdateRow.omit({ rolls: true, tags: true }).extend({
	rolls: z.array(zRoll).optional(),
	tags: z.array(z.string()).optional(),
});

// ============================================================================
// Modifier - JSON fields: rollTargetTags (string[]), sheetAdjustments (SheetAdjustment[])
// ============================================================================
export const zModifier = zModifierRow
	.omit({ rollTargetTags: true, sheetAdjustments: true })
	.extend({
		rollTargetTags: z.array(z.string()),
		sheetAdjustments: z.array(zSheetAdjustment),
	});

export const zNewModifier = zNewModifierRow
	.omit({ rollTargetTags: true, sheetAdjustments: true })
	.extend({
		rollTargetTags: z.array(z.string()).optional(),
		sheetAdjustments: z.array(zSheetAdjustment).optional(),
	});

export const zModifierUpdate = zModifierUpdateRow
	.omit({ rollTargetTags: true, sheetAdjustments: true })
	.extend({
		rollTargetTags: z.array(z.string()).optional(),
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
// SheetRecord - JSON fields: sheet (Sheet), conditions (Modifier[])
// ============================================================================
export const zSheetRecord = zSheetRecordRow.omit({ sheet: true, conditions: true }).extend({
	sheet: zSheet,
	conditions: z.array(zModifier),
});

export const zNewSheetRecord = zNewSheetRecordRow.omit({ sheet: true, conditions: true }).extend({
	sheet: zSheet,
	conditions: z.array(zModifier).optional(),
});

export const zSheetRecordUpdate = zSheetRecordUpdateRow
	.omit({ sheet: true, conditions: true })
	.extend({
		sheet: zSheet.optional(),
		conditions: z.array(zModifier).optional(),
	});
