import { CommandExport } from '../../command.js';
import { ActionCommand } from './action-command.js';
import { ActionAssignSubCommand } from './action-assign-subcommand.js';
import { ActionCopyImportedAttackSubCommand } from './action-copy-imported-attack-subcommand.js';
import { ActionCreateSubCommand } from './action-create-subcommand.js';
import { ActionDetailSubCommand } from './action-detail-subcommand.js';
import { ActionSetSubCommand } from './action-set-subcommand.js';
import { ActionExportSubCommand } from './action-export-subcommand.js';
import { ActionImportSubCommand } from './action-import-subcommand.js';
import { ActionListSubCommand } from './action-list-subcommand.js';
import { ActionRemoveSubCommand } from './action-remove-subcommand.js';

export const ActionCommandExport: CommandExport = {
	command: ActionCommand,
	subCommands: [
		ActionAssignSubCommand,
		ActionCopyImportedAttackSubCommand,
		ActionCreateSubCommand,
		ActionDetailSubCommand,
		ActionSetSubCommand,
		ActionExportSubCommand,
		ActionImportSubCommand,
		ActionListSubCommand,
		ActionRemoveSubCommand,
	],
};
