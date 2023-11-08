export type { Sheet } from './shared/sheet.zod.js';

import type { Action } from './shared/action.zod.js';
import type { Modifier } from './shared/modifier.zod.js';
import type { RollMacro } from './shared/roll-macro.zod.js';

export type Actions = Action[];
export type Modifiers = Modifier[];
export type RollMacros = RollMacro[];

export type { Action, Modifier, RollMacro };
