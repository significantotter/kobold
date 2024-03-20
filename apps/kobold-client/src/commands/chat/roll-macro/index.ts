import { CommandExport } from '../../command.js';
import { RollMacroCommand } from './roll-macro-command.js';
import { RollMacroCreateSubCommand } from './roll-macro-create-subcommand.js';
import { RollMacroListSubCommand } from './roll-macro-list-subcommand.js';
import { RollMacroRemoveSubCommand } from './roll-macro-remove-subcommand.js';
import { RollMacroUpdateSubCommand } from './roll-macro-update-subcommand.js';

export const RollMacroCommandExport: CommandExport = {
	command: RollMacroCommand,
	subCommands: [
		RollMacroCreateSubCommand,
		RollMacroListSubCommand,
		RollMacroRemoveSubCommand,
		RollMacroUpdateSubCommand,
	],
};
