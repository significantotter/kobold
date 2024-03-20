import { CommandExport } from '../../command.js';
import { ActionStageAddAdvancedDamageSubCommand } from './action-stage-add-advanced-damage-subcommand.js';
import { ActionStageAddAttackSubCommand } from './action-stage-add-attack-subcommand.js';
import { ActionStageAddBasicDamageSubCommand } from './action-stage-add-basic-damage-subcommand.js';
import { ActionStageAddSaveSubCommand } from './action-stage-add-save-subcommand.js';
import { ActionStageAddSkillChallengeSubCommand } from './action-stage-add-skill-challenge-subcommand.js';
import { ActionStageAddTextSubCommand } from './action-stage-add-text-subcommand.js';
import { ActionStageCommand } from './action-stage-command.js';
import { ActionStageEditSubCommand } from './action-stage-edit-subcommand.js';
import { ActionStageRemoveSubCommand } from './action-stage-remove-subcommand.js';

export const ActionStageCommandExport: CommandExport = {
	command: ActionStageCommand,
	subCommands: [
		ActionStageAddAdvancedDamageSubCommand,
		ActionStageAddAttackSubCommand,
		ActionStageAddBasicDamageSubCommand,
		ActionStageAddSaveSubCommand,
		ActionStageAddSkillChallengeSubCommand,
		ActionStageAddTextSubCommand,
		ActionStageEditSubCommand,
		ActionStageRemoveSubCommand,
	],
};
