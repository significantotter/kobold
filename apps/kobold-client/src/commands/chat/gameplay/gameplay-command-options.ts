import {
	APIApplicationCommandBasicOption,
	ApplicationCommandOptionType,
	ChannelType,
} from 'discord.js';
import L from '../../../i18n/i18n-node.js';
import { SheetBaseCounterKeys } from '@kobold/db';

export class GameplayOptions {
	public static readonly GAMEPLAY_SET_OPTION: APIApplicationCommandBasicOption = {
		name: L.en.commandOptions.gameplaySetOption.name(),
		description: L.en.commandOptions.gameplaySetOption.description(),
		required: true,
		type: ApplicationCommandOptionType.String,
		choices: Object.values(SheetBaseCounterKeys).map(key => ({
			name: L.en.commandOptions.gameplaySetOption.choices[key].name(),
			value: L.en.commandOptions.gameplaySetOption.choices[key].value(),
		})),
	};
	public static readonly GAMEPLAY_DAMAGE_AMOUNT: APIApplicationCommandBasicOption = {
		name: L.en.commandOptions.gameplayDamageAmount.name(),
		description: L.en.commandOptions.gameplayDamageAmount.description(),
		required: true,
		autocomplete: false,
		type: ApplicationCommandOptionType.Number,
	};
	public static readonly GAMEPLAY_DAMAGE_TYPE: APIApplicationCommandBasicOption = {
		name: L.en.commandOptions.gameplayDamageType.name(),
		description: L.en.commandOptions.gameplayDamageType.description(),
		required: false,
		autocomplete: false,
		type: ApplicationCommandOptionType.String,
	};
	public static readonly GAMEPLAY_SET_VALUE: APIApplicationCommandBasicOption = {
		name: L.en.commandOptions.gameplaySetValue.name(),
		description: L.en.commandOptions.gameplaySetValue.description(),
		required: true,
		autocomplete: false,
		type: ApplicationCommandOptionType.String,
	};
	public static readonly GAMEPLAY_TARGET_CHARACTER: APIApplicationCommandBasicOption = {
		name: L.en.commandOptions.gameplayTargetCharacter.name(),
		description: L.en.commandOptions.gameplayTargetCharacter.description(),
		required: true,
		autocomplete: true,
		type: ApplicationCommandOptionType.String,
	};
	public static readonly GAMEPLAY_TARGET_CHANNEL: APIApplicationCommandBasicOption = {
		name: L.en.commandOptions.gameplayTargetChannel.name(),
		description: L.en.commandOptions.gameplayTargetChannel.description(),
		required: false,
		type: ApplicationCommandOptionType.Channel,
		channel_types: [ChannelType.GuildText],
	};
	public static readonly GAMEPLAY_TRACKER_MODE: APIApplicationCommandBasicOption = {
		name: L.en.commandOptions.gameplayTrackerMode.name(),
		description: L.en.commandOptions.gameplayTrackerMode.description(),
		required: false,
		type: ApplicationCommandOptionType.String,
		choices: [
			{
				name: L.en.commandOptions.gameplayTrackerMode.choices.countersOnly.name(),
				value: L.en.commandOptions.gameplayTrackerMode.choices.countersOnly.value(),
			},
			{
				name: L.en.commandOptions.gameplayTrackerMode.choices.basicStats.name(),
				value: L.en.commandOptions.gameplayTrackerMode.choices.basicStats.value(),
			},
			{
				name: L.en.commandOptions.gameplayTrackerMode.choices.fullSheet.name(),
				value: L.en.commandOptions.gameplayTrackerMode.choices.fullSheet.value(),
			},
		],
	};
}
