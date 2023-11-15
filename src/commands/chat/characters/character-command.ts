import {
	ApplicationCommandOptionChoiceData,
	ApplicationCommandOptionType,
	ApplicationCommandType,
	AutocompleteFocusedOption,
	AutocompleteInteraction,
	CacheType,
	ChatInputCommandInteraction,
	PermissionsString,
	RESTPostAPIChatInputApplicationCommandsJSONBody,
} from 'discord.js';
import { RateLimiter } from 'discord.js-rate-limiter';
import L from '../../../i18n/i18n-node.js';
import { CharacterOptions } from './command-options.js';

import { TranslationFunctions } from '../../../i18n/i18n-types.js';
import { CommandUtils } from '../../../utils/index.js';
import { InjectedServices } from '../../command.js';
import { Command, CommandDeferType } from '../../index.js';

export class CharacterCommand implements Command {
	public names = [L.en.commands.character.name()];
	public metadata: RESTPostAPIChatInputApplicationCommandsJSONBody = {
		type: ApplicationCommandType.ChatInput,
		name: L.en.commands.character.name(),
		description: L.en.commands.character.description(),
		dm_permission: true,
		default_member_permissions: undefined,

		options: [
			{
				// IMPORT
				name: L.en.commands.character.importWanderersGuide.name(),
				description: L.en.commands.character.importWanderersGuide.description(),
				type: ApplicationCommandOptionType.Subcommand,
				options: [CharacterOptions.IMPORT_OPTION],
			},
			{
				// IMPORT PathBuilder
				name: L.en.commands.character.importPathbuilder.name(),
				description: L.en.commands.character.importPathbuilder.description(),
				type: ApplicationCommandOptionType.Subcommand,
				options: [
					CharacterOptions.IMPORT_PATHBUILDER_OPTION,
					CharacterOptions.IMPORT_USE_STAMINA_OPTION,
				],
			},
			{
				// LIST
				name: L.en.commands.character.list.name(),
				description: L.en.commands.character.list.description(),
				type: ApplicationCommandOptionType.Subcommand,
			},
			{
				// REMOVE
				name: L.en.commands.character.remove.name(),
				description: L.en.commands.character.remove.description(),
				type: ApplicationCommandOptionType.Subcommand,
			},
			{
				// SET-ACTIVE
				name: L.en.commands.character.setActive.name(),
				description: L.en.commands.character.setActive.description(),
				type: ApplicationCommandOptionType.Subcommand,
				options: [CharacterOptions.SET_ACTIVE_NAME_OPTION],
			},
			{
				// SET-DEFAULT
				name: L.en.commands.character.setDefault.name(),
				description: L.en.commands.character.setDefault.description(),
				type: ApplicationCommandOptionType.Subcommand,
				options: [
					CharacterOptions.CHARACTER_SET_DEFAULT_SCOPE,
					CharacterOptions.SET_ACTIVE_NAME_OPTION,
				],
			},
			{
				// SHEET
				name: L.en.commands.character.sheet.name(),
				description: L.en.commands.character.sheet.description(),
				type: ApplicationCommandOptionType.Subcommand,
			},
			{
				// UPDATE
				name: L.en.commands.character.update.name(),
				description: L.en.commands.character.update.description(),
				type: ApplicationCommandOptionType.Subcommand,
				options: [{ ...CharacterOptions.IMPORT_PATHBUILDER_OPTION, required: false }],
			},
		],
	};
	public cooldown = new RateLimiter(1, 2000);
	public deferType = CommandDeferType.PUBLIC;
	public requireClientPerms: PermissionsString[] = [];

	constructor(public commands: Command[]) {}

	public async autocomplete(
		intr: AutocompleteInteraction<CacheType>,
		option: AutocompleteFocusedOption,
		services: InjectedServices
	): Promise<ApplicationCommandOptionChoiceData[] | undefined> {
		if (!intr.isAutocomplete()) return;

		let command = CommandUtils.getSubCommandByName(this.commands, intr.options.getSubcommand());
		if (!command || !command.autocomplete) {
			return;
		}

		return await command.autocomplete(intr, option, services);
	}

	public async execute(
		intr: ChatInputCommandInteraction,
		LL: TranslationFunctions,
		services: InjectedServices
	): Promise<void> {
		if (!intr.isChatInputCommand()) return;
		let command = CommandUtils.getSubCommandByName(this.commands, intr.options.getSubcommand());
		if (!command) {
			return;
		}

		let passesChecks = await CommandUtils.runChecks(command, intr);
		if (passesChecks) {
			await command.execute(intr, LL, services);
		}
	}
}
