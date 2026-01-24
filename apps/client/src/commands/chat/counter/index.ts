import { CommandExport } from '../../command.js';
import { CounterCommand } from './counter-command.js';
import { CounterCreateSubCommand } from './counter-create-subcommand.js';
import { CounterDisplaySubCommand } from './counter-display-subcommand.js';
import { CounterListSubCommand } from './counter-list-subcommand.js';
import { CounterPrepareManySubCommand } from './counter-prepare-many-subcommand.js';
import { CounterPrepareSubCommand } from './counter-prepare-subcommand.js';
import { CounterRemoveSubCommand } from './counter-remove-subcommand.js';
import { CounterResetSubCommand } from './counter-reset-subcommand.js';
import { CounterSetSubCommand } from './counter-set-subcommand.js';
import { CounterUseSlotSubCommand } from './counter-use-slot-subcommand.js';
import { CounterValueSubCommand } from './counter-value-subcommand.js';

export const CounterCommandExport: CommandExport = {
	command: CounterCommand,
	subCommands: [
		CounterCreateSubCommand,
		CounterDisplaySubCommand,
		CounterListSubCommand,
		CounterPrepareSubCommand,
		CounterPrepareManySubCommand,
		CounterUseSlotSubCommand,
		CounterRemoveSubCommand,
		CounterResetSubCommand,
		CounterSetSubCommand,
		CounterValueSubCommand,
	],
};
