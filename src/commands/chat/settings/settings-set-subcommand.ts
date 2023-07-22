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
import { EventData } from '../../../models/internal-models.js';
import { Command, CommandDeferType } from '../../index.js';
import { Language } from '../../../models/enum-helpers/index.js';
import { TranslationFunctions } from '../../../i18n/i18n-types.js';
import { InteractionUtils } from '../../../utils/interaction-utils.js';
import { AutocompleteUtils } from '../../../utils/autocomplete-utils.js';
import _ from 'lodash';
import { SettableSheetOption } from '../../../utils/creature.js';
import { InitiativeActor, UserSettings } from '../../../services/kobold/models/index.js';
import { GameUtils } from '../../../utils/game-utils.js';
import { KoboldError } from '../../../utils/KoboldError.js';

export class SettingsSetSubCommand implements Command {
	public names = [Language.LL.commands.settings.set.name()];
	public metadata: RESTPostAPIChatInputApplicationCommandsJSONBody = {
		type: ApplicationCommandType.ChatInput,
		name: Language.LL.commands.settings.set.name(),
		description: Language.LL.commands.settings.set.description(),
		dm_permission: true,
		default_member_permissions: undefined,
	};
	public deferType = CommandDeferType.PUBLIC;
	public requireClientPerms: PermissionsString[] = [];

	public async autocomplete(
		intr: AutocompleteInteraction<CacheType>,
		option: AutocompleteFocusedOption
	): Promise<ApplicationCommandOptionChoiceData[]> {
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
		}
	}

	public async execute(
		intr: ChatInputCommandInteraction,
		data: EventData,
		LL: TranslationFunctions
	): Promise<void> {
		const option = intr.options.getString(SettingsOptions.SETTINGS_SET_OPTION.name);
		const value = intr.options.getString(SettingsOptions.SETTINGS_SET_VALUE.name);

		// validate
		let trimmedOptionName = option.trim().toLowerCase().replaceAll(' ', '_');

		if (trimmedOptionName === 'initiative-tracker-notifications') {
			if (!['never', 'every turn', 'every round', 'whenever hidden'].includes(value)) {
				throw new KoboldError(
					'Yip! The value for "initiative-tracker-notifications" must be one of "never", ' +
						'"every turn", "every round", or "whenever hidden".'
				);
			}
		} else {
			throw new KoboldError(`Yip! "${option}" is not a valid option.`);
		}

		// insert

		UserSettings.query().upsertGraph({
			userId: intr.user.id,
			[trimmedOptionName]: value,
		});

		await InteractionUtils.send(intr, `Yip! "${option}" has been set to "${value}".`);
	}
}
