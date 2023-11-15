import {
	ApplicationCommandType,
	RESTPostAPIChatInputApplicationCommandsJSONBody,
	AutocompleteFocusedOption,
	AutocompleteInteraction,
	CacheType,
	ChatInputCommandInteraction,
	PermissionsString,
	ApplicationCommandOptionChoiceData,
} from 'discord.js';

import { SettingsOptions } from './settings-command-options.js';

import { Command, CommandDeferType } from '../../index.js';
import L from '../../../i18n/i18n-node.js';
import { TranslationFunctions } from '../../../i18n/i18n-types.js';
import { InteractionUtils } from '../../../utils/interaction-utils.js';
import _ from 'lodash';
import { KoboldError } from '../../../utils/KoboldError.js';
import { Kobold, UserSettings, UserSettingsModel } from '../../../services/kobold/index.js';
import { KoboldUtils } from '../../../utils/kobold-service-utils/kobold-utils.js';

export class SettingsSetSubCommand implements Command {
	public names = [L.en.commands.settings.set.name()];
	public metadata: RESTPostAPIChatInputApplicationCommandsJSONBody = {
		type: ApplicationCommandType.ChatInput,
		name: L.en.commands.settings.set.name(),
		description: L.en.commands.settings.set.description(),
		dm_permission: true,
		default_member_permissions: undefined,
	};
	public deferType = CommandDeferType.PUBLIC;
	public requireClientPerms: PermissionsString[] = [];

	public async autocomplete(
		intr: AutocompleteInteraction<CacheType>,
		option: AutocompleteFocusedOption,
		{ kobold }: { kobold: Kobold }
	): Promise<ApplicationCommandOptionChoiceData[] | undefined> {
		if (!intr.isAutocomplete()) return;
		if (
			option.name === SettingsOptions.SETTINGS_SET_VALUE.name &&
			intr.options.getString(SettingsOptions.SETTINGS_SET_OPTION.name) ===
				'initiative-tracker-notifications'
		) {
			return ['never', 'every turn', 'every round', 'whenever hidden'].map(choice => ({
				name: choice,
				value: choice,
			}));
		} else if (
			option.name === SettingsOptions.SETTINGS_SET_VALUE.name &&
			intr.options.getString(SettingsOptions.SETTINGS_SET_OPTION.name) ===
				'inline-rolls-display'
		) {
			return ['detailed', 'compact'].map(choice => ({
				name: choice,
				value: choice,
			}));
		}
	}

	public async execute(
		intr: ChatInputCommandInteraction,
		LL: TranslationFunctions,
		{ kobold }: { kobold: Kobold }
	): Promise<void> {
		const option = intr.options.getString(SettingsOptions.SETTINGS_SET_OPTION.name, true);
		const value = intr.options.getString(SettingsOptions.SETTINGS_SET_VALUE.name, true);

		const koboldUtils = new KoboldUtils(kobold);
		const { userSettings } = await koboldUtils.fetchNonNullableDataForCommand(intr, {
			userSettings: true,
		});

		// validate
		let trimmedOptionName = _.camelCase(option.trim());
		let settingDbName: keyof UserSettings;
		let parsedValue: string;

		if (trimmedOptionName === 'initiativeTrackerNotifications') {
			settingDbName = 'initStatsNotification';
			if (!['never', 'every turn', 'every round', 'whenever hidden'].includes(value)) {
				throw new KoboldError(
					'Yip! The value for "initiative-tracker-notifications" must be one of "never", ' +
						'"every turn", "every round", or "whenever hidden".'
				);
			}
			parsedValue = value.replaceAll(' ', '_');
		} else if (trimmedOptionName === 'inlineRollsDisplay') {
			settingDbName = 'inlineRollsDisplay';
			if (!['compact', 'detailed'].includes(value)) {
				throw new KoboldError(
					'Yip! The value for "inline-rolls-display" must be one of "compact", or "detailed".'
				);
			}
			parsedValue = value.replaceAll(' ', '_');
		} else {
			throw new KoboldError(`Yip! "${option}" is not a valid option.`);
		}

		// fetch the value to determine whether to insert or update

		userSettings[settingDbName] = parsedValue;
		await kobold.userSettings.upsert(userSettings);

		await InteractionUtils.send(intr, `Yip! "${option}" has been set to "${value}".`);
	}
}
