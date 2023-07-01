import {
	ApplicationCommandType,
	RESTPostAPIChatInputApplicationCommandsJSONBody,
	ChatInputCommandInteraction,
	PermissionsString,
	ApplicationCommandOptionChoiceData,
	AutocompleteFocusedOption,
	AutocompleteInteraction,
	CacheType,
} from 'discord.js';

import { EventData } from '../../../models/internal-models.js';
import { Command, CommandDeferType } from '../../index.js';
import { Language } from '../../../models/enum-helpers/index.js';
import { TranslationFunctions } from '../../../i18n/i18n-types.js';
import { GameplayOptions } from './gameplay-command-options.js';
import { AutocompleteUtils } from '../../../utils/autocomplete-utils.js';
import { GameplayUtils } from '../../../utils/gameplay-utils.js';
import { InteractionUtils } from '../../../utils/interaction-utils.js';
import { CharacterUtils } from '../../../utils/character-utils.js';
import { Character, InitiativeActor } from '../../../services/kobold/models/index.js';

export class GameplayRecoverSubCommand implements Command {
	public names = [Language.LL.commands.gameplay.recover.name()];
	public metadata: RESTPostAPIChatInputApplicationCommandsJSONBody = {
		type: ApplicationCommandType.ChatInput,
		name: Language.LL.commands.gameplay.recover.name(),
		description: Language.LL.commands.gameplay.recover.description(),
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
		if (option.name === GameplayOptions.GAMEPLAY_TARGET_CHARACTER.name) {
			return await AutocompleteUtils.getGameplayTargetCharacters(intr, option.value);
		}
	}

	public async execute(
		intr: ChatInputCommandInteraction,
		data: EventData,
		LL: TranslationFunctions
	): Promise<void> {
		const compositeId = intr.options.getString(GameplayOptions.GAMEPLAY_TARGET_CHARACTER.name);

		let targetCharacters = await GameplayUtils.fetchGameplayTargets(intr, compositeId);

		const recoverValues = await GameplayUtils.recoverGameplayStats(targetCharacters);
		if (!recoverValues.length) {
			await InteractionUtils.send(
				intr,
				`Yip! I tried to recover ${targetCharacters[0].name}'s stats, but their stats are already full!`
			);
			return;
		} else {
			let recoveredStats;
			if (
				targetCharacters.some(
					character => character instanceof InitiativeActor && character.hideStats
				)
			) {
				recoveredStats = recoverValues.map(
					recoveredStat =>
						`${recoveredStat.name} increased by ${
							recoveredStat.updatedValue - recoveredStat.initialValue
						}`
				);
			} else {
				recoveredStats = recoverValues.map(
					recoveredStat =>
						`${recoveredStat.name} increased from ${recoveredStat.initialValue} to ${recoveredStat.updatedValue}`
				);
			}
			await InteractionUtils.send(
				intr,
				`Yip! ${targetCharacters[0].name} recovered! ${recoveredStats.join(', ')}`
			);
		}
	}
}
