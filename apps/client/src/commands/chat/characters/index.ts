import { CommandExport } from '../../command.js';
import { CharacterCommand } from './character-command.js';
import { CharacterImportPasteBinSubCommand } from './character-import-pastebin-subcommand.js';
import { CharacterImportPathbuilderSubCommand } from './character-import-pathbuilder-subcommand.js';
import { CharacterImportWanderersGuideSubCommand } from './character-import-wanderers-guide-subcommand.js';
import { CharacterListSubCommand } from './character-list-subcommand.js';
import { CharacterRemoveSubCommand } from './character-remove-subcommand.js';
import { CharacterSetActiveSubCommand } from './character-set-active-subcommand.js';
import { CharacterSetDefaultSubCommand } from './character-set-default.subcommand.js';
import { CharacterSheetSubCommand } from './character-sheet-subcommand.js';
import { CharacterUpdateSubCommand } from './character-update-subcommand.js';

export const CharactersCommandExport: CommandExport = {
	command: CharacterCommand,
	subCommands: [
		CharacterImportPathbuilderSubCommand,
		CharacterImportWanderersGuideSubCommand,
		CharacterImportPasteBinSubCommand,
		CharacterListSubCommand,
		CharacterRemoveSubCommand,
		CharacterSetActiveSubCommand,
		CharacterSetDefaultSubCommand,
		CharacterSheetSubCommand,
		CharacterUpdateSubCommand,
	],
};
