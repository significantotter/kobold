import { ActionStageDefinition } from './action-stage/index.js';
import { ActionDefinition } from './action/index.js';
import { CharacterDefinition } from './character/index.js';
import { CompendiumDefinition } from './compendium/index.js';
import { ConditionDefinition } from './condition/index.js';
import { CounterGroupDefinition } from './counter-group/index.js';
import { CounterDefinition } from './counter/index.js';
import { GameDefinition } from './game/index.js';
import { GameplayDefinition } from './gameplay/index.js';
import { HelpDefinition } from './help/index.js';
import { InitDefinition } from './init/index.js';
import { ModifierDefinition } from './modifier/index.js';
import { RollMacroDefinition } from './roll-macro/index.js';
import { RollDefinition } from './roll/index.js';
import { SettingDefinition } from './setting/index.js';
export * from './action/index.js';
export * from './help/index.js';
export * from './helpers.js';
export type {
	CommandReference,
	CommandDefinition,
	CommandDocumentationEmbed,
	ExtendedOptionDocumentation,
	CommandDocumentationExample,
	SubCommandDocumentationExample,
	CommandDocumentation,
	SubCommandDefinition,
	CommandOptions,
	SpecificCommandOptions,
} from './helpers/commands.types.js';
export const commands = [
	ActionDefinition,
	ActionStageDefinition,
	CharacterDefinition,
	CompendiumDefinition,
	ConditionDefinition,
	CounterDefinition,
	CounterGroupDefinition,
	GameDefinition,
	GameplayDefinition,
	HelpDefinition,
	InitDefinition,
	ModifierDefinition,
	RollDefinition,
	RollMacroDefinition,
	SettingDefinition,
];
export {
	ActionDefinition,
	ActionStageDefinition,
	CharacterDefinition,
	CompendiumDefinition,
	ConditionDefinition,
	CounterDefinition,
	CounterGroupDefinition,
	GameDefinition,
	GameplayDefinition,
	HelpDefinition,
	InitDefinition,
	ModifierDefinition,
	RollDefinition,
	RollMacroDefinition,
	SettingDefinition,
};
