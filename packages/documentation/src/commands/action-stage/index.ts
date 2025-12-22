import type { CommandReference } from '../helpers/commands.types.js';
import {
	actionStageCommandDefinition,
	ActionStageSubCommandEnum,
} from './action-stage.command-definition.js';
import {
	ActionStageCommandOptionEnum,
	actionStageCommandOptions,
	actionStageOptionChoices,
} from './action-stage.command-options.js';
import { actionStageCommandDocumentation } from './action-stage.documentation.js';
import { actionStageStrings } from './action-stage.strings.js';

export * from './action-stage.command-definition.js';
export * from './action-stage.documentation.js';
export * from './action-stage.command-options.js';
export * from './action-stage.strings.js';

export const ActionStageDefinition = {
	definition: actionStageCommandDefinition,
	documentation: actionStageCommandDocumentation,
	options: actionStageCommandOptions,
	subCommandEnum: ActionStageSubCommandEnum,
	commandOptionsEnum: ActionStageCommandOptionEnum,
	strings: actionStageStrings,
	optionChoices: actionStageOptionChoices,
} satisfies CommandReference;
