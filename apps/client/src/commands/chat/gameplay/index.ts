import { CommandExport } from '../../command.js';
import { GameplayCommand } from './gameplay-command.js';
import { GameplayDamageSubCommand } from './gameplay-damage-subcommand.js';
import { GameplayRecoverSubCommand } from './gameplay-recover-subcommand.js';
import { GameplaySetSubCommand } from './gameplay-set-subcommand.js';
import { GameplayTrackerSubCommand } from './gameplay-tracker-subcommand.js';

export const GameplayCommandExport: CommandExport = {
	command: GameplayCommand,
	subCommands: [
		GameplayDamageSubCommand,
		GameplayRecoverSubCommand,
		GameplaySetSubCommand,
		GameplayTrackerSubCommand,
	],
};
