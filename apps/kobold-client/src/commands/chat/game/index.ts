import { CommandExport } from '../../command.js';
import { GameCommand } from './game-command.js';
import { GameGiveSubCommand } from './game-give-subcommand.js';
import { GameInitSubCommand } from './game-init-subcommand.js';
import { GameListSubCommand } from './game-list-subcommand.js';
import { GameManageSubCommand } from './game-manage-subcommand.js';
import { GamePartyStatusSubCommand } from './game-party-status-subcommand.js';
import { GameRollSubCommand } from './game-roll-subcommand.js';

export const GameCommandExport: CommandExport = {
	command: GameCommand,
	subCommands: [
		GameInitSubCommand,
		GameListSubCommand,
		GameManageSubCommand,
		GameRollSubCommand,
		GamePartyStatusSubCommand,
		GameGiveSubCommand,
	],
};
