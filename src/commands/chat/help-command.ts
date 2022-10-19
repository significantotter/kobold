import { KoboldEmbed } from './../../utils/kobold-embed-utils';
import {
	ApplicationCommandType,
	RESTPostAPIChatInputApplicationCommandsJSONBody,
	ChatInputCommandInteraction,
	EmbedBuilder,
	PermissionsString,
	ApplicationCommandOptionType,
} from 'discord.js';

import { ChatArgs } from '../../constants/index.js';
import { TranslationFunctions } from '../../i18n/i18n-types.js';
import { Language } from '../../models/enum-helpers/index.js';
import { EventData } from '../../models/internal-models.js';
import { Lang } from '../../services/index.js';
import { CommandUtils, InteractionUtils } from '../../utils/index.js';
import { Command, CommandDeferType } from '../index.js';
import _ from 'lodash';

export class HelpCommand implements Command {
	public names = [Language.LL.commands.help.name()];
	public metadata: RESTPostAPIChatInputApplicationCommandsJSONBody = {
		type: ApplicationCommandType.ChatInput,
		name: Language.LL.commands.help.name(),
		description: Language.LL.commands.help.description(),
		dm_permission: true,
		default_member_permissions: undefined,
		options: [
			{
				name: Language.LL.commands.help.faq.name(),
				description: Language.LL.commands.help.faq.description(),
				type: ApplicationCommandOptionType.Subcommand.valueOf(),
			},
			{
				name: Language.LL.commands.help.about.name(),
				description: Language.LL.commands.help.about.description(),
				type: ApplicationCommandOptionType.Subcommand.valueOf(),
			},
			{
				name: Language.LL.commands.help.commands.name(),
				description: Language.LL.commands.help.commands.description(),
				type: ApplicationCommandOptionType.Subcommand.valueOf(),
			},
			{
				name: Language.LL.commands.help.init.name(),
				description: Language.LL.commands.help.init.description(),
				type: ApplicationCommandOptionType.Subcommand.valueOf(),
				options: [],
			},
			{
				name: Language.LL.commands.help.roll.name(),
				description: Language.LL.commands.help.roll.description(),
				type: ApplicationCommandOptionType.Subcommand.valueOf(),
				options: [],
			},
		],
	};
	public deferType = CommandDeferType.PUBLIC;
	public requireClientPerms: PermissionsString[] = [];
	public async execute(
		intr: ChatInputCommandInteraction,
		data: EventData,
		LL: TranslationFunctions
	): Promise<void> {
		// look through our options that are subcommands
		const targetSubcommand = intr.options.getSubcommand();
		const allSubcommands = this.metadata.options
			.filter(option => option.type === ApplicationCommandOptionType.Subcommand.valueOf())
			.map(option => option.name);

		const command = _.findLast(allSubcommands, command => command == targetSubcommand) || 'faq';

		let embed = new KoboldEmbed();
		embed.setThumbnail(LL.commands.help.about.interactions.embed.thumbnail());
		switch (command) {
			case Language.LL.commands.help.faq.name(): {
				embed.setTitle(LL.commands.help.about.interactions.embed.title());
				embed.addFields([
					{
						name: LL.commands.help.faq.interactions.embed.addToServer.name(),
						value: LL.commands.help.faq.interactions.embed.addToServer.value(),
					},
					{
						name: LL.commands.help.faq.interactions.embed.slashCommands.name(),
						value: LL.commands.help.faq.interactions.embed.slashCommands.value(),
					},
					{
						name: LL.commands.help.faq.interactions.embed.commandOptions.name(),
						value: LL.commands.help.faq.interactions.embed.commandOptions.value(),
					},
					{
						name: LL.commands.help.faq.interactions.embed.importCharacter.name(),
						value: LL.commands.help.faq.interactions.embed.importCharacter.value(),
					},
					{
						name: LL.commands.help.faq.interactions.embed.initiative.name(),
						value: LL.commands.help.faq.interactions.embed.initiative.value(),
					},
				]);
				break;
			}
			case Language.LL.commands.help.about.name(): {
				embed.setTitle(LL.commands.help.about.interactions.embed.title());
				embed.setDescription(LL.commands.help.about.interactions.embed.description());
				embed.addFields([
					{
						name: LL.commands.help.about.interactions.embed.authorField.name(),
						value: LL.commands.help.about.interactions.embed.authorField.value(),
					},
					{
						name: LL.commands.help.about.interactions.embed.featuresField.name(),
						value: LL.commands.help.about.interactions.embed.featuresField.value(),
					},
					{
						name: LL.commands.help.about.interactions.embed.linksField.name(),
						value: LL.commands.help.about.interactions.embed.linksField.value(),
					},
				]);
				break;
			}
			case Language.LL.commands.help.commands.name(): {
				embed.setTitle(LL.commands.help.about.interactions.embed.title());
				embed.setDescription(LL.commands.help.about.interactions.embed.description());

				break;
			}
			case Language.LL.commands.help.character.name(): {
				embed.setTitle(LL.commands.help.about.interactions.embed.title());
				embed.setDescription(LL.commands.help.about.interactions.embed.description());

				break;
			}
			case Language.LL.commands.help.roll.name(): {
				embed.setTitle(LL.commands.help.about.interactions.embed.title());
				embed.setDescription(LL.commands.help.about.interactions.embed.description());

				break;
			}
			case Language.LL.commands.help.init.name(): {
				embed.setTitle(LL.commands.help.about.interactions.embed.title());
				embed.setDescription(LL.commands.help.about.interactions.embed.description());

				break;
			}
			default: {
				return;
			}
		}

		await InteractionUtils.send(intr, embed);
	}
}
