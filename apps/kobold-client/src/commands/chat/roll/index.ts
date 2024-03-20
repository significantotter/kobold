import { CommandExport } from '../../command.js';
import { RollActionSubCommand } from './roll-action-subcommand.js';
import { RollAttackSubCommand } from './roll-attack-subcommand.js';
import { RollCommand } from './roll-command.js';
import { RollDiceSubCommand } from './roll-dice-subcommand.js';
import { RollPerceptionSubCommand } from './roll-perception-subcommand.js';
import { RollSaveSubCommand } from './roll-save-subcommand.js';
import { RollSkillSubCommand } from './roll-skill-subcommand.js';

export const RollCommandExport: CommandExport = {
	command: RollCommand,
	subCommands: [
		RollActionSubCommand,
		RollAttackSubCommand,
		RollDiceSubCommand,
		RollPerceptionSubCommand,
		RollSaveSubCommand,
		RollSkillSubCommand,
	],
};
