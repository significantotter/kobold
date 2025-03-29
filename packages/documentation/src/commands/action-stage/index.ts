import type { CommandReference } from '../helpers/commands.d.js';
import { actionStageCommandDefinition } from './action-stage.command-definition.js';
import { actionStageCommandOptions } from './action-stage.command-options.js';
import { actionStageCommandDocumentation } from './action-stage.documentation.js';

export * from './action-stage.command-definition.js';
export * from './action-stage.documentation.js';
export * from './action-stage.command-options.js';

export const ActionStageCommand = {
	definition: actionStageCommandDefinition,
	documentation: actionStageCommandDocumentation,
	options: actionStageCommandOptions,
} satisfies CommandReference;
