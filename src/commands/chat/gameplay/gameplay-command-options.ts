import {
	APIApplicationCommandBasicOption,
	ApplicationCommandOptionType,
	ChannelType,
} from 'discord.js';
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
	public static readonly GAMEPLAY_DAMAGE_AMOUNT: APIApplicationCommandBasicOption = {
		name: Language.LL.commandOptions.gameplayDamageAmount.name(),
		description: Language.LL.commandOptions.gameplayDamageAmount.description(),
		required: true,
		autocomplete: false,
		type: ApplicationCommandOptionType.Number,
	};
	public static readonly GAMEPLAY_DAMAGE_TYPE: APIApplicationCommandBasicOption = {
		name: Language.LL.commandOptions.gameplayDamageType.name(),
		description: Language.LL.commandOptions.gameplayDamageType.description(),
		required: false,
		autocomplete: false,
		type: ApplicationCommandOptionType.String,
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
	public static readonly GAMEPLAY_TARGET_CHANNEL: APIApplicationCommandBasicOption = {
		name: Language.LL.commandOptions.gameplayTargetChannel.name(),
		description: Language.LL.commandOptions.gameplayTargetChannel.description(),
		required: false,
		autocomplete: true,
		type: ApplicationCommandOptionType.Channel,
		channel_types: [ChannelType.GuildText],
	};
	public static readonly GAMEPLAY_TRACKER_MODE: APIApplicationCommandBasicOption = {
		name: Language.LL.commandOptions.gameplayTrackerMode.name(),
		description: Language.LL.commandOptions.gameplayTrackerMode.description(),
		required: false,
		type: ApplicationCommandOptionType.String,
		choices: [
			{
				name: Language.LL.commandOptions.gameplayTrackerMode.choices.countersOnly.name(),
				value: Language.LL.commandOptions.gameplayTrackerMode.choices.countersOnly.value(),
			},
			{
				name: Language.LL.commandOptions.gameplayTrackerMode.choices.basicStats.name(),
				value: Language.LL.commandOptions.gameplayTrackerMode.choices.basicStats.value(),
			},
			{
				name: Language.LL.commandOptions.gameplayTrackerMode.choices.fullSheet.name(),
				value: Language.LL.commandOptions.gameplayTrackerMode.choices.fullSheet.value(),
			},
		],
	};
}
