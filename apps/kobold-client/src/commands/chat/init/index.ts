import { CommandExport } from '../../command.js';
import { InitAddSubCommand } from './init-add-subcommand.js';
import { InitCommand } from './init-command.js';
import { InitEndSubCommand } from './init-end-subcommand.js';
import { InitJoinSubCommand } from './init-join-subcommand.js';
import { InitJumpToSubCommand } from './init-jump-to-subcommand.js';
import { InitNextSubCommand } from './init-next-subcommand.js';
import { InitNoteSubCommand } from './init-note-subcommand.js';
import { InitPrevSubCommand } from './init-prev-subcommand.js';
import { InitRemoveSubCommand } from './init-remove-subcommand.js';
import { InitRollSubCommand } from './init-roll-subcommand.js';
import { InitSetSubCommand } from './init-set-subcommand.js';
import { InitShowSubCommand } from './init-show-subcommand.js';
import { InitStartSubCommand } from './init-start-subcommand.js';
import { InitStatBlockSubCommand } from './init-stat-block-subcommand.js';

export const InitCommandExport: CommandExport = {
	command: InitCommand,
	subCommands: [
		InitAddSubCommand,
		InitEndSubCommand,
		InitNoteSubCommand,
		InitJoinSubCommand,
		InitJumpToSubCommand,
		InitNextSubCommand,
		InitPrevSubCommand,
		InitRemoveSubCommand,
		InitRollSubCommand,
		InitSetSubCommand,
		InitShowSubCommand,
		InitStartSubCommand,
		InitStatBlockSubCommand,
	],
};
