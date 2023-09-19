import { Character } from './../models/character/character.model.js';
import { Sheet as BaseSheet } from './shared-schemas/sheet.schema.js';
import type {
	Initiative,
	InitiativeActor,
	Character,
	InitiativeActorGroup,
} from '../models/index.ts';

export type InitWithActorsAndGroups = Initiative & {
	actors: (InitiativeActor & { character: Character })[];
	actorGroups: InitiativeActorGroup[];
};

export type Action = Character['actions'][number];
export type Modifier = Character['modifiers'][number];
export type SheetModifier = Extract<Modifier, { modifierType: 'sheet' }>;
export type RollModifier = Extract<Modifier, { modifierType: 'roll' }>;
export type RollMacro = Character['rollMacros'][number];
export type SheetAdjustment = NonNullable<SheetModifier['sheetAdjustments']>[number];

export type Lore = BaseSheet['skills']['lores'][number];

export interface Sheet extends BaseSheet {
	actions: Action[];
	modifiers: Modifier[];
	rollMacros: RollMacro[];
}
