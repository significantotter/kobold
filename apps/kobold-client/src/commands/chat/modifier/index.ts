import { CommandExport } from '../../command.js';
import { ModifierCommand } from './modifier-command.js';
import { ModifierCreateSubCommand } from './modifier-create-subcommand.js';
import { ModifierDetailSubCommand } from './modifier-detail-subcommand.js';
import { ModifierExportSubCommand } from './modifier-export-subcommand.js';
import { ModifierImportSubCommand } from './modifier-import-subcommand.js';
import { ModifierListSubCommand } from './modifier-list-subcommand.js';
import { ModifierRemoveSubCommand } from './modifier-remove-subcommand.js';
import { ModifierSeveritySubCommand } from './modifier-severity-subcommand.js';
import { ModifierToggleSubCommand } from './modifier-toggle-subcommand.js';
import { ModifierSetSubCommand } from './modifier-set-subcommand.js';

export const ModifierCommandExport: CommandExport = {
	command: ModifierCommand,
	subCommands: [
		ModifierCreateSubCommand,
		ModifierDetailSubCommand,
		ModifierExportSubCommand,
		ModifierImportSubCommand,
		ModifierListSubCommand,
		ModifierRemoveSubCommand,
		ModifierToggleSubCommand,
		ModifierSeveritySubCommand,
		ModifierSetSubCommand,
	],
};
