import { APIApplicationCommandBasicOption, ApplicationCommandOptionType } from 'discord.js';
import { Language } from '../../../models/enum-helpers/index.js';

export class GameplayOptions {
	public static readonly GAMEPLAY_SET_OPTION: APIApplicationCommandBasicOption = {
		name: Language.LL.commandOptions.gameplaySetOption.name(),
		description: Language.LL.commandOptions.gameplaySetOption.description(),
		required: true,
		type: ApplicationCommandOptionType.String,
		choices: [
			{
				name: Language.LL.commandOptions.gameplaySetOption.choices.hp.name(),
				value: Language.LL.commandOptions.gameplaySetOption.choices.hp.value(),
			},
			{
				name: Language.LL.commandOptions.gameplaySetOption.choices.tempHp.name(),
				value: Language.LL.commandOptions.gameplaySetOption.choices.tempHp.value(),
			},
			{
				name: Language.LL.commandOptions.gameplaySetOption.choices.stamina.name(),
				value: Language.LL.commandOptions.gameplaySetOption.choices.stamina.value(),
			},
			{
				name: Language.LL.commandOptions.gameplaySetOption.choices.resolve.name(),
				value: Language.LL.commandOptions.gameplaySetOption.choices.resolve.value(),
			},
			{
				name: Language.LL.commandOptions.gameplaySetOption.choices.heroPoints.name(),
				value: Language.LL.commandOptions.gameplaySetOption.choices.heroPoints.value(),
			},
			{
				name: Language.LL.commandOptions.gameplaySetOption.choices.focusPoints.name(),
				value: Language.LL.commandOptions.gameplaySetOption.choices.focusPoints.value(),
			},
		],
	};
	public static readonly GAMEPLAY_SET_VALUE: APIApplicationCommandBasicOption = {
		name: Language.LL.commandOptions.gameplaySetValue.name(),
		description: Language.LL.commandOptions.gameplaySetValue.description(),
		required: true,
		autocomplete: false,
		type: ApplicationCommandOptionType.String,
	};
	public static readonly GAMEPLAY_TARGET_CHARACTER: APIApplicationCommandBasicOption = {
		name: Language.LL.commandOptions.gameplayTargetCharacter.name(),
		description: Language.LL.commandOptions.gameplayTargetCharacter.description(),
		required: false,
		autocomplete: true,
		type: ApplicationCommandOptionType.String,
	};
}
