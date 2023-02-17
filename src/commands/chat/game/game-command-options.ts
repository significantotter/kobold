import { APIApplicationCommandBasicOption, ApplicationCommandOptionType } from 'discord.js';
import { Language } from '../../../models/enum-helpers/index.js';

export class GameOptions {
	public static readonly GAME_MANAGE_OPTION: APIApplicationCommandBasicOption = {
		name: Language.LL.commandOptions.gameManageOption.name(),
		description: Language.LL.commandOptions.gameManageOption.description(),
		required: true,
		type: ApplicationCommandOptionType.String,
		choices: [
			{
				name: Language.LL.commandOptions.gameManageOption.choices.create.name(),
				value: Language.LL.commandOptions.gameManageOption.choices.create.value(),
			},
			{
				name: Language.LL.commandOptions.gameManageOption.choices.join.name(),
				value: Language.LL.commandOptions.gameManageOption.choices.join.value(),
			},
			{
				name: Language.LL.commandOptions.gameManageOption.choices.setActive.name(),
				value: Language.LL.commandOptions.gameManageOption.choices.setActive.value(),
			},
			{
				name: Language.LL.commandOptions.gameManageOption.choices.leave.name(),
				value: Language.LL.commandOptions.gameManageOption.choices.leave.value(),
			},
			{
				name: Language.LL.commandOptions.gameManageOption.choices.kick.name(),
				value: Language.LL.commandOptions.gameManageOption.choices.kick.value(),
			},
			{
				name: Language.LL.commandOptions.gameManageOption.choices.delete.name(),
				value: Language.LL.commandOptions.gameManageOption.choices.delete.value(),
			},
		],
	};
	public static readonly GAME_MANAGE_VALUE: APIApplicationCommandBasicOption = {
		name: Language.LL.commandOptions.gameManageValue.name(),
		description: Language.LL.commandOptions.gameManageValue.description(),
		required: true,
		autocomplete: true,
		type: ApplicationCommandOptionType.String,
	};
}
