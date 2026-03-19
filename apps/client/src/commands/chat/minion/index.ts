import { CommandExport } from '../../command.js';
import { MinionCommand } from './minion-command.js';
import { MinionCreateSubCommand } from './minion-create-subcommand.js';
import { MinionListSubCommand } from './minion-list-subcommand.js';
import { MinionRemoveSubCommand } from './minion-remove-subcommand.js';
import { MinionRollSubCommand } from './minion-roll-subcommand.js';
import { MinionSetSubCommand } from './minion-set-subcommand.js';
import { MinionSheetSubCommand } from './minion-sheet-subcommand.js';
import { MinionUpdateSubCommand } from './minion-update-subcommand.js';

export const MinionCommandExport: CommandExport = {
	command: MinionCommand,
	subCommands: [
		MinionCreateSubCommand,
		MinionListSubCommand,
		MinionRemoveSubCommand,
		MinionRollSubCommand,
		MinionSetSubCommand,
		MinionSheetSubCommand,
		MinionUpdateSubCommand,
	],
};
