export type { NpcData, NpcFluff } from './shared/npc-data.js';
export type { Sheet } from './shared/sheet.zod.js';

import type { Action } from './shared/action.zod.js';
import type { Modifier } from './shared/modifier.zod.js';
import type { RollMacro } from './shared/roll-macro.zod.js';
import type {
	InitStatsNotificationEnum,
	InlineRollsDisplayEnum,
	RollCompactModeEnum,
} from './lib/enum-helpers.js';
import type { SheetRecordTrackerModeEnum } from './shared/sheet.zod.js';

export type Actions = Action[];
export type Modifiers = Modifier[];
export type RollMacros = RollMacro[];

export type {
	Action,
	Modifier,
	RollMacro,
	InitStatsNotificationEnum,
	InlineRollsDisplayEnum,
	RollCompactModeEnum,
	SheetRecordTrackerModeEnum,
};
