import {
	ApplicationCommandOptionChoiceData,
	AutocompleteFocusedOption,
	AutocompleteInteraction,
	CacheType,
	ChatInputCommandInteraction,
} from 'discord.js';
import _ from 'lodash';
import {
	DefaultCompendiumEnum,
	Kobold,
	UserSettings,
	isDefaultCompendiumEnum,
	isInitStatsNotificationEnum,
	isInlineRollsDisplayEnum,
} from '@kobold/db';
import { KoboldError } from '../../../utils/KoboldError.js';
import { InteractionUtils } from '../../../utils/interaction-utils.js';
import { KoboldUtils } from '../../../utils/kobold-service-utils/kobold-utils.js';
import { Command } from '../../index.js';
import { BaseCommandClass } from '../../command.js';
import { SettingDefinition } from '@kobold/documentation';
const commandOptions = SettingDefinition.options;
const commandOptionsEnum = SettingDefinition.commandOptionsEnum;

export class SettingsSetSubCommand extends BaseCommandClass(
	SettingDefinition,
	SettingDefinition.subCommandEnum.set
) {
	public async autocomplete(
		intr: AutocompleteInteraction<CacheType>,
		option: AutocompleteFocusedOption,
		{ kobold }: { kobold: Kobold }
	): Promise<ApplicationCommandOptionChoiceData[] | undefined> {
		if (!intr.isAutocomplete()) return;
		if (
			option.name === commandOptions[commandOptionsEnum.value].name &&
			intr.options.getString(commandOptions[commandOptionsEnum.set].name) ===
				'initiative-tracker-notifications'
		) {
			return ['never', 'every turn', 'every round', 'whenever hidden'].map(choice => ({
				name: choice,
				value: choice,
			}));
		} else if (
			option.name === commandOptions[commandOptionsEnum.value].name &&
			intr.options.getString(commandOptions[commandOptionsEnum.set].name) ===
				'inline-rolls-display'
		) {
			return ['detailed', 'compact'].map(choice => ({
				name: choice,
				value: choice,
			}));
		} else if (
			option.name === commandOptions[commandOptionsEnum.value].name &&
			intr.options.getString(commandOptions[commandOptionsEnum.set].name) ===
				'default-compendium'
		) {
			return [DefaultCompendiumEnum.nethys, DefaultCompendiumEnum.pf2etools].map(choice => ({
				name: choice,
				value: choice,
			}));
		}
	}

	public async execute(
		intr: ChatInputCommandInteraction,
		{ kobold }: { kobold: Kobold }
	): Promise<void> {
		const option = intr.options.getString(commandOptions[commandOptionsEnum.set].name, true);
		const value = intr.options.getString(commandOptions[commandOptionsEnum.value].name, true);

		const koboldUtils = new KoboldUtils(kobold);
		const { userSettings } = await koboldUtils.fetchNonNullableDataForCommand(intr, {
			userSettings: true,
		});

		// validate
		let trimmedOptionName = _.camelCase(option.trim());
		let settingDbName: keyof UserSettings;
		let parsedValue = value.replaceAll(' ', '_');

		const updates: Partial<UserSettings> = {};

		if (trimmedOptionName === 'initiativeTrackerNotifications') {
			settingDbName = 'initStatsNotification';
			if (!isInitStatsNotificationEnum(parsedValue)) {
				throw new KoboldError(
					'Yip! The value for "initiative-tracker-notifications" must be one of "never", ' +
						'"every turn", "every round", or "whenever hidden".'
				);
			}
			updates.initStatsNotification = parsedValue;
		} else if (trimmedOptionName === 'inlineRollsDisplay') {
			settingDbName = 'inlineRollsDisplay';
			if (!isInlineRollsDisplayEnum(parsedValue)) {
				throw new KoboldError(
					'Yip! The value for "inline-rolls-display" must be one of "compact", or "detailed".'
				);
			}
			updates.inlineRollsDisplay = parsedValue;
		} else if (trimmedOptionName === 'defaultCompendium') {
			settingDbName = 'defaultCompendium';
			if (!isDefaultCompendiumEnum(parsedValue)) {
				throw new KoboldError(
					'Yip! The value for "inline-rolls-display" must be one of "compact", or "detailed".'
				);
			}
			updates.defaultCompendium = parsedValue;
		} else {
			throw new KoboldError(`Yip! "${option}" is not a valid option.`);
		}

		// fetch the value to determine whether to insert or update

		await kobold.userSettings.upsert({ ...userSettings, ...updates });

		await InteractionUtils.send(intr, `Yip! "${option}" has been set to "${value}".`);
	}
}
