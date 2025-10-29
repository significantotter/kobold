import { ApplicationCommandOptionType } from 'discord-api-types/v10';
import type { CommandOptions, SpecificCommandOptions } from '../helpers/commands.d.ts';

export enum SettingCommandOptionEnum {
	set = 'set',
	value = 'value',
}

export const settingCommandOptions: CommandOptions = {
	[SettingCommandOptionEnum.set]: {
		name: 'option',
		description: 'The option to update.',
		required: true,
		type: ApplicationCommandOptionType.String,
		choices: [
			{
				name: 'initiative-tracker-notifications',
				value: 'initiative-tracker-notifications',
			},
			{
				name: 'inline-rolls-display',
				value: 'inline-rolls-display',
			},
			{
				name: 'default-compendium',
				value: 'default-compendium',
			},
		],
	},
	[SettingCommandOptionEnum.value]: {
		name: 'value',
		description: 'The value to set the option to.',
		required: true,
		autocomplete: true,
		type: ApplicationCommandOptionType.String,
	},
} satisfies SpecificCommandOptions<SettingCommandOptionEnum>;
