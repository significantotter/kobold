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
	const langBase = LL.commands[_.camelCase(command)][_.camelCase(operation)];

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
				name: Language.LL.commands.help.gameplay.name(),
				description: Language.LL.commands.help.gameplay.description(),
				type: ApplicationCommandOptionType.Subcommand.valueOf(),
				options: [],
			},
			{
				name: Language.LL.commands.help.attributesAndTags.name(),
				description: Language.LL.commands.help.attributesAndTags.description(),
				type: ApplicationCommandOptionType.Subcommand.valueOf(),
				options: [],
			},
			{
				name: Language.LL.commands.help.makingACustomAction.name(),
				description: Language.LL.commands.help.makingACustomAction.description(),
				type: ApplicationCommandOptionType.Subcommand.valueOf(),
				options: [
					{
						name: 'example-choice',
						description: 'Which custom action should we walk through?',
						required: true,
						type: ApplicationCommandOptionType.String,
						choices: [
							{
								name: 'Produce Flame (simple attack roll cantrip)',
								value: 'produceFlame',
							},
							{
								name: 'Fireball (simple save with basic damage)',
								value: 'fireball',
							},
							{
								name: 'Phantom Pain (save with complex results)',
								value: 'phantomPain',
							},
							{
								name: 'Gunslinger: Paired Shots (mutliple strikes with deadly crits)',
								value: 'gunslingerPairedShots',
							},
						],
					},
				],
			},
			{
				name: Language.LL.commands.help.rollMacro.name(),
				description: Language.LL.commands.help.rollMacro.description(),
				type: ApplicationCommandOptionType.Subcommand.valueOf(),
				options: [],
			},
			{
				name: Language.LL.commands.help.action.name(),
				description: Language.LL.commands.help.action.description(),
				type: ApplicationCommandOptionType.Subcommand.valueOf(),
				options: [],
			},
			{
				name: Language.LL.commands.help.actionStage.name(),
				description: Language.LL.commands.help.actionStage.description(),
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
						name: LL.commands.help.faq.interactions.embed.importWanderersGuideCharacter.name(),
						value: LL.commands.help.faq.interactions.embed.importWanderersGuideCharacter.value(),
					},
					{
						name: LL.commands.help.faq.interactions.embed.importPathbuilderCharacter.name(),
						value: LL.commands.help.faq.interactions.embed.importPathbuilderCharacter.value(),
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
							`\`/${LL.commands.character.name()} ${LL.commands.character.importWanderersGuide.name()}\` ${LL.commands.character.importWanderersGuide.description()}\n` +
							`\`/${LL.commands.character.name()} ${LL.commands.character.importPathbuilder.name()}\` ${LL.commands.character.importPathbuilder.description()}\n` +
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
							`\`/${LL.commands.roll.name()} ${LL.commands.roll.action.name()}\` ${LL.commands.roll.action.description()}\n` +
							`\`/${LL.commands.roll.name()} ${LL.commands.roll.attack.name()}\` ${LL.commands.roll.attack.description()}\n` +
							`\`/${LL.commands.roll.name()} ${LL.commands.roll.ability.name()}\` ${LL.commands.roll.ability.description()}`,
					},
					{
						name: LL.commands.init.name(),
						value:
							`\`/${LL.commands.init.name()} ${LL.commands.init.start.name()}\` ${LL.commands.init.start.description()}\n` +
							`\`/${LL.commands.init.name()} ${LL.commands.init.join.name()}\` ${LL.commands.init.join.description()}\n` +
							`\`/${LL.commands.init.name()} ${LL.commands.init.add.name()}\` ${LL.commands.init.add.description()}\n` +
							`\`/${LL.commands.init.name()} ${LL.commands.init.roll.name()}\` ${LL.commands.init.roll.description()}\n` +
							`\`/${LL.commands.init.name()} ${LL.commands.init.statBlock.name()}\` ${LL.commands.init.statBlock.description()}\n` +
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
							`\`/${LL.commands.game.name()} ${LL.commands.game.roll.name()}\` ${LL.commands.game.roll.description()}\n` +
							`\`/${LL.commands.game.name()} ${LL.commands.game.init.name()}\` ${LL.commands.game.init.description()}\n` +
							`\`/${LL.commands.game.name()} ${LL.commands.game.list.name()}\` ${LL.commands.game.list.description()}\n`,
					},
					{
						name: LL.commands.gameplay.name(),
						value:
							`\`/${LL.commands.gameplay.name()} ${LL.commands.gameplay.set.name()}\` ${LL.commands.gameplay.set.description()}\n` +
							`\`/${LL.commands.gameplay.name()} ${LL.commands.gameplay.recover.name()}\` ${LL.commands.gameplay.recover.description()}\n`,
					},
					{
						name: LL.commands.action.name(),
						value:
							`\`/${LL.commands.action.name()} ${LL.commands.action.create.name()}\` ${LL.commands.action.create.description()}\n` +
							`\`/${LL.commands.action.name()} ${LL.commands.action.detail.name()}\` ${LL.commands.action.detail.description()}\n` +
							`\`/${LL.commands.action.name()} ${LL.commands.action.edit.name()}\` ${LL.commands.action.edit.description()}\n` +
							`\`/${LL.commands.action.name()} ${LL.commands.action.export.name()}\` ${LL.commands.action.export.description()}\n` +
							`\`/${LL.commands.action.name()} ${LL.commands.action.import.name()}\` ${LL.commands.action.import.description()}\n` +
							`\`/${LL.commands.action.name()} ${LL.commands.action.list.name()}\` ${LL.commands.action.list.description()}\n` +
							`\`/${LL.commands.action.name()} ${LL.commands.action.remove.name()}\` ${LL.commands.action.remove.description()}\n`,
					},
					{
						name: LL.commands.actionStage.name(),
						value:
							`\`/${LL.commands.actionStage.name()} ${LL.commands.actionStage.addAttack.name()}\` ${LL.commands.actionStage.addAttack.description()}\n` +
							`\`/${LL.commands.actionStage.name()} ${LL.commands.actionStage.addSave.name()}\` ${LL.commands.actionStage.addSave.description()}\n` +
							`\`/${LL.commands.actionStage.name()} ${LL.commands.actionStage.addBasicDamage.name()}\` ${LL.commands.actionStage.addBasicDamage.description()}\n` +
							`\`/${LL.commands.actionStage.name()} ${LL.commands.actionStage.addAdvancedDamage.name()}\` ${LL.commands.actionStage.addAdvancedDamage.description()}\n` +
							`\`/${LL.commands.actionStage.name()} ${LL.commands.actionStage.addText.name()}\` ${LL.commands.actionStage.addText.description(
								{
									addTextRollInput: '{{}}',
								}
							)}\n` +
							`\`/${LL.commands.actionStage.name()} ${LL.commands.actionStage.edit.name()}\` ${LL.commands.actionStage.edit.description()}\n` +
							`\`/${LL.commands.actionStage.name()} ${LL.commands.actionStage.remove.name()}\` ${LL.commands.actionStage.remove.description()}\n`,
					},
					{
						name: LL.commands.rollMacro.name(),
						value:
							`\`/${LL.commands.rollMacro.name()} ${LL.commands.rollMacro.create.name()}\` ${LL.commands.rollMacro.create.description()}\n` +
							`\`/${LL.commands.rollMacro.name()} ${LL.commands.rollMacro.update.name()}\` ${LL.commands.rollMacro.update.description()}\n` +
							`\`/${LL.commands.rollMacro.name()} ${LL.commands.rollMacro.list.name()}\` ${LL.commands.rollMacro.list.description()}\n` +
							`\`/${LL.commands.rollMacro.name()} ${LL.commands.rollMacro.remove.name()}\` ${LL.commands.rollMacro.remove.description()}\n`,
					},
				]);
				break;
			}
			case Language.LL.commands.help.character.name(): {
				embed.setTitle(LL.commands.help.character.interactions.embed.title());
				embed.setDescription(LL.commands.help.character.interactions.embed.description());
				embed.addFields(
					[
						LL.commands.character.importWanderersGuide.name(),
						LL.commands.character.importPathbuilder.name(),
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
						LL.commands.init.roll.name(),
						LL.commands.init.statBlock.name(),
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
						LL.commands.roll.action.name(),
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
					[
						LL.commands.game.manage.name(),
						LL.commands.game.roll.name(),
						LL.commands.game.init.name(),
						LL.commands.game.list.name(),
					].map(command =>
						createCommandOperationHelpField(LL.commands.game.name(), command, LL)
					)
				);
				break;
			}
			case Language.LL.commands.help.gameplay.name(): {
				embed.setTitle(LL.commands.help.gameplay.interactions.embed.title());
				embed.setDescription(LL.commands.help.gameplay.interactions.embed.description());
				embed.addFields(
					[LL.commands.gameplay.set.name(), LL.commands.gameplay.recover.name()].map(
						command =>
							createCommandOperationHelpField(
								LL.commands.gameplay.name(),
								command,
								LL
							)
					)
				);
				break;
			}

			case Language.LL.commands.help.action.name(): {
				embed.setTitle(LL.commands.help.action.interactions.embed.title());
				embed.setDescription(LL.commands.help.action.interactions.embed.description());
				embed.addFields(
					[
						LL.commands.action.create.name(),
						LL.commands.action.detail.name(),
						LL.commands.action.list.name(),
						LL.commands.action.edit.name(),
						LL.commands.action.remove.name(),
						LL.commands.action.export.name(),
						LL.commands.action.import.name(),
					].map(command =>
						createCommandOperationHelpField(LL.commands.action.name(), command, LL)
					)
				);
				break;
			}

			case Language.LL.commands.help.actionStage.name(): {
				embed.setTitle(LL.commands.help.actionStage.interactions.embed.title());
				embed.setDescription(LL.commands.help.actionStage.interactions.embed.description());
				const actionStageFields = [
					LL.commands.actionStage.addAttack.name(),
					LL.commands.actionStage.addSave.name(),
					LL.commands.actionStage.addBasicDamage.name(),
					LL.commands.actionStage.addAdvancedDamage.name(),
					LL.commands.actionStage.addText.name(),
					LL.commands.actionStage.edit.name(),
					LL.commands.actionStage.remove.name(),
				].map(command =>
					createCommandOperationHelpField(LL.commands.actionStage.name(), command, LL)
				);
				actionStageFields.splice(3, 0, {
					name: LL.commands.actionStage.addText.name(),
					value: LL.commands.actionStage.addText.description({
						addTextRollInput: '{{}}',
					}),
				});
				embed.addFields(actionStageFields);
				break;
			}

			case Language.LL.commands.help.rollMacro.name(): {
				embed.setTitle(LL.commands.help.rollMacro.interactions.embed.title());
				embed.setDescription(LL.commands.help.rollMacro.interactions.embed.description());
				embed.addFields(
					[
						LL.commands.rollMacro.list.name(),
						LL.commands.rollMacro.create.name(),
						LL.commands.rollMacro.update.name(),
						LL.commands.rollMacro.remove.name(),
					].map(command =>
						createCommandOperationHelpField(LL.commands.rollMacro.name(), command, LL)
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
			case Language.LL.commands.help.makingACustomAction.name(): {
				const actionChoice = intr.options.getString('example-choice').trim();

				const i18nOptionsByActionChoice = {
					produceFlame: { inlineOne: '{{[spellLevel]}}' },
					phantomPain: { inlineOne: '{{[spellLevel]}}' },
				};
				embed.setTitle(LL.commands.help.makingACustomAction.interactions.embed.title());

				embed.setDescription(
					LL.commands.help.makingACustomAction.interactions.embed[actionChoice](
						i18nOptionsByActionChoice[actionChoice]
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
