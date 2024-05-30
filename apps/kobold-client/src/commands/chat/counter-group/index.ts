import { CommandExport } from '../../command.js';
import { CounterGroupCommand } from './counter-group-command.js';
import { CounterGroupCreateSubCommand } from './counter-group-create-subcommand.js';
import { CounterGroupListSubCommand } from './counter-group-list-subcommand.js';
import { CounterGroupDisplaySubCommand } from './counter-group-display-subcommand.js';
import { CounterGroupRemoveSubCommand } from './counter-group-remove-subcommand.js';
import { CounterGroupSetSubCommand } from './counter-group-set-subcommand.js';

export const CounterGroupCommandExport: CommandExport = {
	command: CounterGroupCommand,
	subCommands: [
		CounterGroupCreateSubCommand,
		CounterGroupListSubCommand,
		CounterGroupDisplaySubCommand,
		CounterGroupRemoveSubCommand,
		CounterGroupSetSubCommand,
	],
};
