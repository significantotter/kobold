import { CommandExport } from '../../command.js';
import { ModifierCommand } from './modifier-command.js';
import { ModifierCreateRollModifierSubCommand } from './modifier-create-roll-modifier-subcommand.js';
import { ModifierCreateSheetModifierSubCommand } from './modifier-create-sheet-modifier-subcommand.js';
import { ModifierDetailSubCommand } from './modifier-detail-subcommand.js';
import { ModifierExportSubCommand } from './modifier-export-subcommand.js';
import { ModifierImportSubCommand } from './modifier-import-subcommand.js';
import { ModifierListSubCommand } from './modifier-list-subcommand.js';
import { ModifierRemoveSubCommand } from './modifier-remove-subcommand.js';
import { ModifierSeveritySubCommand } from './modifier-severity-subcommand.js';
import { ModifierToggleSubCommand } from './modifier-toggle-subcommand.js';
import { ModifierUpdateSubCommand } from './modifier-update-subcommand.js';

export const ModifierCommandExport: CommandExport = {
	command: ModifierCommand,
	subCommands: [
		ModifierCreateRollModifierSubCommand,
		ModifierCreateSheetModifierSubCommand,
		ModifierDetailSubCommand,
		ModifierExportSubCommand,
		ModifierImportSubCommand,
		ModifierListSubCommand,
		ModifierRemoveSubCommand,
		ModifierToggleSubCommand,
		ModifierSeveritySubCommand,
		ModifierUpdateSubCommand,
	],
};
