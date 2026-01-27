import { CommandExport } from '../command.js';
import { ActionStageCommandExport } from './action-stage/index.js';
import { ActionCommandExport } from './action/index.js';
import { AdminCommandExport } from './admin/index.js';
import { CharactersCommandExport } from './characters/index.js';
import { CompendiumCommandExport } from './compendium/index.js';
import { GameCommandExport } from './game/index.js';
import { GameplayCommandExport } from './gameplay/index.js';
import { HelpCommandExport } from './help/index.js';
import { InitCommandExport } from './init/index.js';
import { ModifierCommandExport } from './modifier/index.js';
import { RollMacroCommandExport } from './roll-macro/index.js';
import { RollCommandExport } from './roll/index.js';
import { SettingsCommandExport } from './settings/index.js';
import { ConditionCommandExport } from './condition/index.js';
import { CounterCommandExport } from './counter/index.js';
import { CounterGroupCommandExport } from './counter-group/index.js';

export const ChatCommandExports: CommandExport[] = [
	ActionCommandExport,
	ActionStageCommandExport,
	AdminCommandExport,
	CharactersCommandExport,
	CompendiumCommandExport,
	CounterCommandExport,
	CounterGroupCommandExport,
	GameCommandExport,
	GameplayCommandExport,
	HelpCommandExport,
	InitCommandExport,
	ModifierCommandExport,
	RollCommandExport,
	RollMacroCommandExport,
	SettingsCommandExport,
	ConditionCommandExport,
];
