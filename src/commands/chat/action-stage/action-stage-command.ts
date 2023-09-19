import {
	ApplicationCommandOptionType,
	ApplicationCommandType,
	RESTPostAPIChatInputApplicationCommandsJSONBody,
	AutocompleteFocusedOption,
	AutocompleteInteraction,
	CacheType,
	ChatInputCommandInteraction,
	PermissionsString,
	ApplicationCommandOptionChoiceData,
} from 'discord.js';
import { RateLimiter } from 'discord.js-rate-limiter';
import L from '../../../i18n/i18n-node.js';

import { CommandUtils, InteractionUtils } from '../../../utils/index.js';
import { Command, CommandDeferType } from '../../index.js';
import { TranslationFunctions } from '../../../i18n/i18n-types.js';
import { ActionStageOptions } from './action-stage-command-options.js';

export class ActionStageCommand implements Command {
	public names = [L.en.commands.actionStage.name()];
	public metadata: RESTPostAPIChatInputApplicationCommandsJSONBody = {
		type: ApplicationCommandType.ChatInput,
		name: L.en.commands.actionStage.name(),
		description: L.en.commands.actionStage.description(),
		dm_permission: true,
		default_member_permissions: undefined,

		options: [
			{
				name: L.en.commands.actionStage.addAttack.name(),
				description: L.en.commands.actionStage.addAttack.description(),
				type: ApplicationCommandOptionType.Subcommand,
				options: [
					ActionStageOptions.ACTION_TARGET_OPTION,
					ActionStageOptions.ACTION_ROLL_NAME_OPTION,
					ActionStageOptions.ACTION_DICE_ROLL_OPTION,
					{
						...ActionStageOptions.ACTION_ROLL_TARGET_DC_OPTION,
						autocomplete: true,
						choices: undefined,
					},
					ActionStageOptions.ACTION_ROLL_ALLOW_MODIFIERS,
				],
			},
			{
				name: L.en.commands.actionStage.addSkillChallenge.name(),
				description: L.en.commands.actionStage.addSkillChallenge.description(),
				type: ApplicationCommandOptionType.Subcommand,
				options: [
					ActionStageOptions.ACTION_TARGET_OPTION,
					ActionStageOptions.ACTION_ROLL_NAME_OPTION,
					ActionStageOptions.ACTION_DICE_ROLL_OPTION,
					{
						...ActionStageOptions.ACTION_ROLL_TARGET_DC_OPTION,
						autocomplete: true,
						choices: undefined,
					},
					ActionStageOptions.ACTION_ROLL_ALLOW_MODIFIERS,
				],
			},
			{
				name: L.en.commands.actionStage.addBasicDamage.name(),
				description: L.en.commands.actionStage.addBasicDamage.description(),
				type: ApplicationCommandOptionType.Subcommand,
				options: [
					ActionStageOptions.ACTION_TARGET_OPTION,
					ActionStageOptions.ACTION_ROLL_NAME_OPTION,
					ActionStageOptions.ACTION_BASIC_DAMAGE_DICE_ROLL_OPTION,
					ActionStageOptions.ACTION_ROLL_ALLOW_MODIFIERS,
					ActionStageOptions.ACTION_ROLL_HEAL_INSTEAD_OF_DAMAGE,
				],
			},
			{
				name: L.en.commands.actionStage.addAdvancedDamage.name(),
				description: L.en.commands.actionStage.addAdvancedDamage.description(),
				type: ApplicationCommandOptionType.Subcommand,
				options: [
					ActionStageOptions.ACTION_TARGET_OPTION,
					ActionStageOptions.ACTION_ROLL_NAME_OPTION,
					ActionStageOptions.ACTION_SUCCESS_DICE_ROLL_OPTION,
					ActionStageOptions.ACTION_CRITICAL_SUCCESS_DICE_ROLL_OPTION,
					ActionStageOptions.ACTION_CRITICAL_FAILURE_DICE_ROLL_OPTION,
					ActionStageOptions.ACTION_FAILURE_DICE_ROLL_OPTION,
					ActionStageOptions.ACTION_ROLL_ALLOW_MODIFIERS,
					ActionStageOptions.ACTION_ROLL_HEAL_INSTEAD_OF_DAMAGE,
				],
			},
			{
				name: L.en.commands.actionStage.addText.name(),
				description: L.en.commands.actionStage.addText.description({
					addTextRollInput: '{{}}',
				}),
				type: ApplicationCommandOptionType.Subcommand,
				options: [
					ActionStageOptions.ACTION_TARGET_OPTION,
					ActionStageOptions.ACTION_ROLL_NAME_OPTION,
					ActionStageOptions.ACTION_DEFAULT_TEXT_OPTION,
					ActionStageOptions.ACTION_CRITICAL_SUCCESS_TEXT_OPTION,
					ActionStageOptions.ACTION_SUCCESS_TEXT_OPTION,
					ActionStageOptions.ACTION_FAILURE_TEXT_OPTION,
					ActionStageOptions.ACTION_CRITICAL_FAILURE_TEXT_OPTION,
					ActionStageOptions.ACTION_EXTRA_TAGS_OPTION,
				],
			},
			{
				name: L.en.commands.actionStage.addSave.name(),
				description: L.en.commands.actionStage.addSave.description(),
				type: ApplicationCommandOptionType.Subcommand,
				options: [
					ActionStageOptions.ACTION_TARGET_OPTION,
					ActionStageOptions.ACTION_ROLL_NAME_OPTION,
					ActionStageOptions.ACTION_SAVE_ROLL_TYPE_OPTION,
					ActionStageOptions.ACTION_ROLL_ABILITY_DC_OPTION,
				],
			},
			{
				name: L.en.commands.actionStage.edit.name(),
				description: L.en.commands.actionStage.edit.description(),
				type: ApplicationCommandOptionType.Subcommand,
				options: [
					ActionStageOptions.ACTION_ROLL_TARGET_OPTION,
					ActionStageOptions.ACTION_STAGE_EDIT_OPTION,
					ActionStageOptions.ACTION_STAGE_EDIT_VALUE,
					ActionStageOptions.ACTION_STAGE_MOVE_OPTION,
				],
			},
			{
				name: L.en.commands.actionStage.remove.name(),
				description: L.en.commands.actionStage.remove.description(),
				type: ApplicationCommandOptionType.Subcommand,
				options: [ActionStageOptions.ACTION_ROLL_TARGET_OPTION],
			},
		],
	};
	public cooldown = new RateLimiter(1, 2000);
	public deferType = CommandDeferType.PUBLIC;
	public requireClientPerms: PermissionsString[] = [];

	constructor(public commands: Command[]) {}

	public async autocomplete(
		intr: AutocompleteInteraction<CacheType>,
		option: AutocompleteFocusedOption
	): Promise<ApplicationCommandOptionChoiceData[] | undefined> {
		if (!intr.isAutocomplete()) return;

		let command = CommandUtils.getSubCommandByName(this.commands, intr.options.getSubcommand());
		if (!command || !command.autocomplete) {
			return;
		}

		return await command.autocomplete(intr, option);
	}

	public async execute(
		intr: ChatInputCommandInteraction,
		LL: TranslationFunctions
	): Promise<void> {
		if (!intr.isChatInputCommand()) return;
		let command = CommandUtils.getSubCommandByName(this.commands, intr.options.getSubcommand());
		if (!command) {
			return;
		}

		let passesChecks = await CommandUtils.runChecks(command, intr);
		if (passesChecks) {
			await command.execute(intr, LL);
		}
	}
}
