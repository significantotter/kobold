import { KoboldEmbed } from './../../utils/kobold-embed-utils';
import {
	ApplicationCommandType,
	RESTPostAPIChatInputApplicationCommandsJSONBody,
	ChatInputCommandInteraction,
	PermissionsString,
	ApplicationCommandOptionType,
} from 'discord.js';

import { TranslationFunctions } from '../../i18n/i18n-types.js';
import { Language } from '../../models/enum-helpers/index.js';
import { EventData } from '../../models/internal-models.js';
import { InteractionUtils } from '../../utils/index.js';
import { Command, CommandDeferType } from '../index.js';
import _ from 'lodash';

function createCommandOperationHelpField(command, operation, LL) {
	const langBase = LL.commands[command][_.camelCase(operation)];

	let fieldName = `\`/${command} ${operation}`;
	if (langBase.options()) fieldName += ` ${langBase.options()}`;
	fieldName += '`';

	let fieldValue = '';
	if (langBase.usage()) fieldValue += `${langBase.usage()}\n\n`;
	fieldValue += langBase.expandedDescription() || langBase.description();

	return { name: fieldName, value: fieldValue };
}

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
				name: Language.LL.commands.help.character.name(),
				description: Language.LL.commands.help.character.description(),
				type: ApplicationCommandOptionType.Subcommand.valueOf(),
				options: [],
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
			{
				name: Language.LL.commands.help.modifier.name(),
				description: Language.LL.commands.help.modifier.description(),
				type: ApplicationCommandOptionType.Subcommand.valueOf(),
				options: [],
			},
			{
				name: Language.LL.commands.help.game.name(),
				description: Language.LL.commands.help.game.description(),
				type: ApplicationCommandOptionType.Subcommand.valueOf(),
				options: [],
			},
			{
				name: Language.LL.commands.help.attributesAndTags.name(),
				description: Language.LL.commands.help.attributesAndTags.description(),
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
				embed.setTitle(LL.commands.help.commands.interactions.embed.title());
				embed.addFields([
					{
						name: LL.commands.help.commands.name(),
						value:
							`\`/${LL.commands.help.name()} ${LL.commands.help.about.name()}\` ${LL.commands.help.about.description()}\n` +
							`\`/${LL.commands.help.name()} ${LL.commands.help.faq.name()}\` ${LL.commands.help.faq.description()}\n` +
							`\`/${LL.commands.help.name()} ${LL.commands.help.commands.name()}\` ${LL.commands.help.commands.description()}\n` +
							`\`/${LL.commands.help.name()} ${LL.commands.help.character.name()}\` ${LL.commands.help.character.description()}\n` +
							`\`/${LL.commands.help.name()} ${LL.commands.help.roll.name()}\` ${LL.commands.help.roll.description()}\n` +
							`\`/${LL.commands.help.name()} ${LL.commands.help.init.name()}\` ${LL.commands.help.init.description()}`,
					},
					{
						name: LL.commands.character.name(),
						value:
							`\`/${LL.commands.character.name()} ${LL.commands.character.import.name()}\` ${LL.commands.character.import.description()}\n` +
							`\`/${LL.commands.character.name()} ${LL.commands.character.list.name()}\` ${LL.commands.character.list.description()}\n` +
							`\`/${LL.commands.character.name()} ${LL.commands.character.remove.name()}\` ${LL.commands.character.remove.description()}\n` +
							`\`/${LL.commands.character.name()} ${LL.commands.character.setActive.name()}\` ${LL.commands.character.setActive.description()}\n` +
							`\`/${LL.commands.character.name()} ${LL.commands.character.setServerDefault.name()}\` ${LL.commands.character.setServerDefault.description()}\n` +
							`\`/${LL.commands.character.name()} ${LL.commands.character.sheet.name()}\` ${LL.commands.character.sheet.description()}\n` +
							`\`/${LL.commands.character.name()} ${LL.commands.character.update.name()}\` ${LL.commands.character.update.description()}`,
					},
					{
						name: LL.commands.roll.name(),
						value:
							`\`/${LL.commands.roll.name()} ${LL.commands.roll.dice.name()}\` ${LL.commands.roll.dice.description()}\n` +
							`\`/${LL.commands.roll.name()} ${LL.commands.roll.skill.name()}\` ${LL.commands.roll.skill.description()}\n` +
							`\`/${LL.commands.roll.name()} ${LL.commands.roll.perception.name()}\` ${LL.commands.roll.perception.description()}\n` +
							`\`/${LL.commands.roll.name()} ${LL.commands.roll.save.name()}\` ${LL.commands.roll.save.description()}\n` +
							`\`/${LL.commands.roll.name()} ${LL.commands.roll.attack.name()}\` ${LL.commands.roll.attack.description()}\n` +
							`\`/${LL.commands.roll.name()} ${LL.commands.roll.ability.name()}\` ${LL.commands.roll.ability.description()}`,
					},
					{
						name: LL.commands.init.name(),
						value:
							`\`/${LL.commands.init.name()} ${LL.commands.init.start.name()}\` ${LL.commands.init.start.description()}\n` +
							`\`/${LL.commands.init.name()} ${LL.commands.init.join.name()}\` ${LL.commands.init.join.description()}\n` +
							`\`/${LL.commands.init.name()} ${LL.commands.init.add.name()}\` ${LL.commands.init.add.description()}\n` +
							`\`/${LL.commands.init.name()} ${LL.commands.init.next.name()}\` ${LL.commands.init.next.description()}\n` +
							`\`/${LL.commands.init.name()} ${LL.commands.init.prev.name()}\` ${LL.commands.init.prev.description()}\n` +
							`\`/${LL.commands.init.name()} ${LL.commands.init.jumpTo.name()}\` ${LL.commands.init.jumpTo.description()}\n` +
							`\`/${LL.commands.init.name()} ${LL.commands.init.remove.name()}\` ${LL.commands.init.remove.description()}\n` +
							`\`/${LL.commands.init.name()} ${LL.commands.init.show.name()}\` ${LL.commands.init.show.description()}\n` +
							`\`/${LL.commands.init.name()} ${LL.commands.init.set.name()}\` ${LL.commands.init.set.description()}\n` +
							`\`/${LL.commands.init.name()} ${LL.commands.init.end.name()}\` ${LL.commands.init.end.description()}\n`,
					},
					{
						name: LL.commands.modifier.name(),
						value:
							`\`/${LL.commands.modifier.name()} ${LL.commands.modifier.create.name()}\` ${LL.commands.modifier.create.description()}\n` +
							`\`/${LL.commands.modifier.name()} ${LL.commands.modifier.toggle.name()}\` ${LL.commands.modifier.toggle.description()}\n` +
							`\`/${LL.commands.modifier.name()} ${LL.commands.modifier.list.name()}\` ${LL.commands.modifier.list.description()}\n` +
							`\`/${LL.commands.modifier.name()} ${LL.commands.modifier.detail.name()}\` ${LL.commands.modifier.detail.description()}\n` +
							`\`/${LL.commands.modifier.name()} ${LL.commands.modifier.update.name()}\` ${LL.commands.modifier.update.description()}\n` +
							`\`/${LL.commands.modifier.name()} ${LL.commands.modifier.remove.name()}\` ${LL.commands.modifier.remove.description()}\n` +
							`\`/${LL.commands.modifier.name()} ${LL.commands.modifier.import.name()}\` ${LL.commands.modifier.import.description()}\n` +
							`\`/${LL.commands.modifier.name()} ${LL.commands.modifier.export.name()}\` ${LL.commands.modifier.export.description()}\n`,
					},
					{
						name: LL.commands.game.name(),
						value:
							`\`/${LL.commands.game.name()} ${LL.commands.game.manage.name()}\` ${LL.commands.game.manage.description()}\n` +
							`\`/${LL.commands.game.name()} ${LL.commands.game.roll.name()}\` ${LL.commands.game.roll.description()}\n`,
					},
				]);
				break;
			}
			case Language.LL.commands.help.character.name(): {
				embed.setTitle(LL.commands.help.character.interactions.embed.title());
				embed.setDescription(LL.commands.help.character.interactions.embed.description());
				embed.addFields(
					[
						LL.commands.character.import.name(),
						LL.commands.character.update.name(),
						LL.commands.character.list.name(),
						LL.commands.character.setActive.name(),
						LL.commands.character.setServerDefault.name(),
						LL.commands.character.sheet.name(),
						LL.commands.character.remove.name(),
					].map(command =>
						createCommandOperationHelpField(LL.commands.character.name(), command, LL)
					)
				);
				break;
			}
			case Language.LL.commands.help.init.name(): {
				embed.setTitle(LL.commands.help.init.interactions.embed.title());
				embed.setDescription(LL.commands.help.init.interactions.embed.description());
				embed.addFields(
					[
						LL.commands.init.start.name(),
						LL.commands.init.end.name(),
						LL.commands.init.join.name(),
						LL.commands.init.add.name(),
						LL.commands.init.next.name(),
						LL.commands.init.prev.name(),
						LL.commands.init.jumpTo.name(),
						LL.commands.init.remove.name(),
						LL.commands.init.show.name(),
						LL.commands.init.set.name(),
					].map(command =>
						createCommandOperationHelpField(LL.commands.init.name(), command, LL)
					)
				);
				break;
			}
			case Language.LL.commands.help.roll.name(): {
				embed.setTitle(LL.commands.help.roll.interactions.embed.title());
				embed.setDescription(LL.commands.help.roll.interactions.embed.description());
				embed.addFields(
					[
						LL.commands.roll.dice.name(),
						LL.commands.roll.skill.name(),
						LL.commands.roll.perception.name(),
						LL.commands.roll.save.name(),
						LL.commands.roll.ability.name(),
						LL.commands.roll.attack.name(),
					].map(command =>
						createCommandOperationHelpField(LL.commands.roll.name(), command, LL)
					)
				);
				break;
			}
			case Language.LL.commands.help.modifier.name(): {
				embed.setTitle(LL.commands.help.modifier.interactions.embed.title());
				embed.setDescription(LL.commands.help.modifier.interactions.embed.description());
				embed.addFields(
					[
						LL.commands.modifier.create.name(),
						LL.commands.modifier.toggle.name(),
						LL.commands.modifier.list.name(),
						LL.commands.modifier.detail.name(),
						LL.commands.modifier.update.name(),
						LL.commands.modifier.remove.name(),
						LL.commands.modifier.import.name(),
						LL.commands.modifier.export.name(),
					].map(command =>
						createCommandOperationHelpField(LL.commands.modifier.name(), command, LL)
					)
				);
				break;
			}
			case Language.LL.commands.help.game.name(): {
				embed.setTitle(LL.commands.help.game.interactions.embed.title());
				embed.setDescription(LL.commands.help.game.interactions.embed.description());
				embed.addFields(
					[LL.commands.game.manage.name(), LL.commands.game.roll.name()].map(command =>
						createCommandOperationHelpField(LL.commands.game.name(), command, LL)
					)
				);
				break;
			}
			case Language.LL.commands.help.attributesAndTags.name(): {
				embed.setTitle(LL.commands.help.attributesAndTags.interactions.embed.title());
				embed.setDescription(
					LL.commands.help.attributesAndTags.interactions.embed.description()
				);
				embed.addFields(
					_.map(
						LL.commands.help.attributesAndTags.interactions.embed.attributes,
						(attributeList, attribute) => ({
							name: attribute,
							value: _.values(attributeList)
								.map(value => value())
								.join('\n'),
							inline: true,
						})
					)
				);
				break;
			}
			default: {
				return;
			}
		}
		await InteractionUtils.send(intr, embed);
	}
}
