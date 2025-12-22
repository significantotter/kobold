import { CommandExport } from '../../command.js';
import { GameCommand } from './game-command.js';
import { GameCreateSubCommand } from './game-create-subcommand.js';
import { GameDeleteSubCommand } from './game-delete-subcommand.js';
import { GameGiveSubCommand } from './game-give-subcommand.js';
import { GameInitSubCommand } from './game-init-subcommand.js';
import { GameJoinSubCommand } from './game-join-subcommand.js';
import { GameKickSubCommand } from './game-kick-subcommand.js';
import { GameLeaveSubCommand } from './game-leave-subcommand.js';
import { GameListSubCommand } from './game-list-subcommand.js';
import { GamePartyStatusSubCommand } from './game-party-status-subcommand.js';
import { GameRollSubCommand } from './game-roll-subcommand.js';
import { GameSetActiveSubCommand } from './game-set-active-subcommand.js';

export const GameCommandExport: CommandExport = {
	command: GameCommand,
	subCommands: [
		GameCreateSubCommand,
		GameJoinSubCommand,
		GameSetActiveSubCommand,
		GameLeaveSubCommand,
		GameKickSubCommand,
		GameDeleteSubCommand,
		GameInitSubCommand,
		GameListSubCommand,
		GameRollSubCommand,
		GamePartyStatusSubCommand,
		GameGiveSubCommand,
	],
};
