import { CommandExport } from '../../command.js';
import { SettingsCommand } from './settings-command.js';
import { SettingsSetSubCommand } from './settings-set-subcommand.js';

export const SettingsCommandExport: CommandExport = {
	command: SettingsCommand,
	subCommands: [SettingsSetSubCommand],
};
