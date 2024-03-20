import { CommandExport } from '../../command.js';
import { CompendiumCommand } from './compendium-command.js';
import { CompendiumSearchSubCommand } from './compendium-search-subcommand.js';

export const CompendiumCommandExport: CommandExport = {
	command: CompendiumCommand,
	subCommands: [CompendiumSearchSubCommand],
};
