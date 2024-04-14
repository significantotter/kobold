import { CommandExport } from '../../command.js';
import { ConditionApplyCustomSubCommand } from './condition-apply-custom-subcommand.js';
import { ConditionApplyModifierSubCommand } from './condition-apply-modifier-subcommand.js';
import { ConditionCommand } from './condition-command.js';
import { ConditionListSubCommand } from './condition-list-subcommand.js';
import { ConditionRemoveSubCommand } from './condition-remove-subcommand.js';
import { ConditionSetSubCommand } from './condition-set-subcommand.js';
import { ConditionSeveritySubCommand } from './condition-severity-subcommand.js';

export const ConditionCommandExport: CommandExport = {
	command: ConditionCommand,
	subCommands: [
		ConditionApplyCustomSubCommand,
		ConditionApplyModifierSubCommand,
		ConditionListSubCommand,
		ConditionSetSubCommand,
		ConditionRemoveSubCommand,
		ConditionSeveritySubCommand,
	],
};
