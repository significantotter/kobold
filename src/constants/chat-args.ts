import {
	APIApplicationCommandBasicOption,
	ApplicationCommandOptionType,
} from 'discord-api-types/v10';
import { Application } from 'discord.js';

import { HelpOption, InfoOption } from '../enums/index.js';
import { Language } from '../models/enum-helpers/index.js';
import { Lang } from '../services/index.js';

export class ChatArgs {
	public static readonly HELP_OPTION: APIApplicationCommandBasicOption = {
		name: Lang.getRef('arguments.option', Language.Default),
		name_localizations: Lang.getRefLocalizationMap('arguments.option'),
		description: Lang.getRef('argDescs.helpOption', Language.Default),
		description_localizations: Lang.getRefLocalizationMap('argDescs.helpOption'),
		type: ApplicationCommandOptionType.String,
		choices: [
			{
				name: Lang.getRef('helpOptions.commands', Language.Default),
				name_localizations: Lang.getRefLocalizationMap('helpOptions.commands'),
				value: HelpOption.COMMANDS,
			},
			{
				name: Lang.getRef('helpOptions.permissions', Language.Default),
				name_localizations: Lang.getRefLocalizationMap('helpOptions.permissions'),
				value: HelpOption.PERMISSIONS,
			},
			{
				name: Lang.getRef('helpOptions.faq', Language.Default),
				name_localizations: Lang.getRefLocalizationMap('helpOptions.faq'),
				value: HelpOption.FAQ,
			},
		],
	};
	public static readonly INFO_OPTION: APIApplicationCommandBasicOption = {
		name: Lang.getRef('arguments.option', Language.Default),
		name_localizations: Lang.getRefLocalizationMap('arguments.option'),
		description: Lang.getRef('argDescs.helpOption', Language.Default),
		description_localizations: Lang.getRefLocalizationMap('argDescs.helpOption'),
		type: ApplicationCommandOptionType.String,
		choices: [
			{
				name: Lang.getRef('infoOptions.about', Language.Default),
				name_localizations: Lang.getRefLocalizationMap('infoOptions.about'),
				value: InfoOption.ABOUT,
			},
			{
				name: Lang.getRef('infoOptions.translate', Language.Default),
				name_localizations: Lang.getRefLocalizationMap('infoOptions.translate'),
				value: InfoOption.TRANSLATE,
			},
			{
				name: Lang.getRef('infoOptions.dev', Language.Default),
				name_localizations: Lang.getRefLocalizationMap('infoOptions.dev'),
				value: InfoOption.DEV,
			},
		],
	};
	public static readonly IMPORT_OPTION: APIApplicationCommandBasicOption = {
		name: 'url',
		description: `The url of your wanderer's guide character.`,
		required: true,
		type: ApplicationCommandOptionType.String,
	};
	public static readonly SET_ACTIVE_NAME_OPTION: APIApplicationCommandBasicOption = {
		name: 'name',
		description: `The name of your wanderer's guide character.`,
		required: false,
		type: ApplicationCommandOptionType.String,
	};
	public static readonly SET_ACTIVE_ID_OPTION: APIApplicationCommandBasicOption = {
		name: 'character_id',
		description: `The id of your wanderer's guide character.`,
		required: false,
		type: ApplicationCommandOptionType.Integer,
	};
	public static readonly ROLL_EXPRESSION_OPTION: APIApplicationCommandBasicOption = {
		name: 'dice',
		description: 'The dice expression to roll. Similar to Roll20 dice rolls.',
		required: true,
		type: ApplicationCommandOptionType.String,
	};
	public static readonly SKILL_CHOICE_OPTION: APIApplicationCommandBasicOption = {
		name: 'skill',
		description: 'The skill to roll.',
		required: true,
		autocomplete: true,
		type: ApplicationCommandOptionType.String,
	};
	public static readonly ROLL_MODIFIER_OPTION: APIApplicationCommandBasicOption = {
		name: 'modifier',
		description: 'A dice expression to modify your roll. (e.g. "+ 1 + 1d4")',
		required: true,
		type: ApplicationCommandOptionType.String,
	};
	public static readonly ROLL_NOTE_OPTION: APIApplicationCommandBasicOption = {
		name: 'note',
		description: 'A note about the reason for the roll.',
		required: true,
		type: ApplicationCommandOptionType.String,
	};
}
