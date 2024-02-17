import { APIApplicationCommandBasicOption, ApplicationCommandOptionType } from 'discord.js';
import L from '../../../i18n/i18n-node.js';

export class GameOptions {
	public static readonly GAME_MANAGE_OPTION: APIApplicationCommandBasicOption = {
		name: L.en.commandOptions.gameManageOption.name(),
		description: L.en.commandOptions.gameManageOption.description(),
		required: true,
		type: ApplicationCommandOptionType.String,
		choices: [
			{
				name: L.en.commandOptions.gameManageOption.choices.create.name(),
				value: L.en.commandOptions.gameManageOption.choices.create.value(),
			},
			{
				name: L.en.commandOptions.gameManageOption.choices.join.name(),
				value: L.en.commandOptions.gameManageOption.choices.join.value(),
			},
			{
				name: L.en.commandOptions.gameManageOption.choices.setActive.name(),
				value: L.en.commandOptions.gameManageOption.choices.setActive.value(),
			},
			{
				name: L.en.commandOptions.gameManageOption.choices.leave.name(),
				value: L.en.commandOptions.gameManageOption.choices.leave.value(),
			},
			{
				name: L.en.commandOptions.gameManageOption.choices.kick.name(),
				value: L.en.commandOptions.gameManageOption.choices.kick.value(),
			},
			{
				name: L.en.commandOptions.gameManageOption.choices.delete.name(),
				value: L.en.commandOptions.gameManageOption.choices.delete.value(),
			},
		],
	};
	public static readonly GAME_MANAGE_VALUE: APIApplicationCommandBasicOption = {
		name: L.en.commandOptions.gameManageValue.name(),
		description: L.en.commandOptions.gameManageValue.description(),
		required: true,
		autocomplete: true,
		type: ApplicationCommandOptionType.String,
	};
	public static readonly GAME_ROLL_TYPE: APIApplicationCommandBasicOption = {
		name: L.en.commandOptions.gameRollType.name(),
		description: L.en.commandOptions.gameRollType.description(),
		required: true,
		autocomplete: true,
		type: ApplicationCommandOptionType.String,
	};
	public static readonly GAME_TARGET_CHARACTER: APIApplicationCommandBasicOption = {
		name: L.en.commandOptions.gameTargetCharacter.name(),
		description: L.en.commandOptions.gameTargetCharacter.description(),
		required: false,
		autocomplete: true,
		type: ApplicationCommandOptionType.String,
	};
	public static readonly GAME_DICE_ROLL_OR_MODIFIER: APIApplicationCommandBasicOption = {
		name: L.en.commandOptions.gameDiceRollOrModifier.name(),
		description: L.en.commandOptions.gameDiceRollOrModifier.description(),
		required: false,
		type: ApplicationCommandOptionType.String,
	};
}
