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

import { GameplayOptions } from './gameplay-command-options.js';
import { EventData } from '../../../models/internal-models.js';
import { Command, CommandDeferType } from '../../index.js';
import { Language } from '../../../models/enum-helpers/index.js';
import { TranslationFunctions } from '../../../i18n/i18n-types.js';
import { InteractionUtils } from '../../../utils/interaction-utils.js';
import { AutocompleteUtils } from '../../../utils/autocomplete-utils.js';
import { GameplayUtils } from '../../../utils/gameplay-utils.js';
import _ from 'lodash';
import { SettableSheetOption } from '../../../utils/creature.js';
import { CharacterUtils } from '../../../utils/character-utils.js';
import { Character, InitiativeActor } from '../../../services/kobold/models/index.js';
import { GameUtils } from '../../../utils/game-utils.js';

export class GameplaySetSubCommand implements Command {
	public names = [Language.LL.commands.gameplay.set.name()];
	public metadata: RESTPostAPIChatInputApplicationCommandsJSONBody = {
		type: ApplicationCommandType.ChatInput,
		name: Language.LL.commands.gameplay.set.name(),
		description: Language.LL.commands.gameplay.set.description(),
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
			return await AutocompleteUtils.getAllTargetOptions(intr, option.value);
		}
	}

	public async execute(
		intr: ChatInputCommandInteraction,
		data: EventData,
		LL: TranslationFunctions
	): Promise<void> {
		const targetCharacter = intr.options.getString(
			GameplayOptions.GAMEPLAY_TARGET_CHARACTER.name
		);
		const option = _.camelCase(
			intr.options.getString(GameplayOptions.GAMEPLAY_SET_OPTION.name)
		) as SettableSheetOption;
		const value = intr.options.getString(GameplayOptions.GAMEPLAY_SET_VALUE.name);

		const { characterOrInitActorTargets } = await GameUtils.getCharacterOrInitActorTarget(
			intr,
			targetCharacter
		);

		const { initialValue, updatedValue } = await GameplayUtils.setGameplayStats(
			intr,
			characterOrInitActorTargets,
			option,
			value
		);
		let message;

		if (
			characterOrInitActorTargets.some(
				character => character instanceof InitiativeActor && character.hideStats
			)
		) {
			let verbed = 'increased';
			let diff = updatedValue - initialValue;
			if (diff < 0) {
				verbed = 'decreased';
			}
			message = `Yip! I ${verbed} ${
				characterOrInitActorTargets[0].name
			}'s ${option} by ${Math.abs(diff)}.`;
		} else {
			message = `Yip! I updated ${characterOrInitActorTargets[0].name}'s ${option} from ${initialValue} to ${updatedValue}.`;
		}
		if (option === 'hp' && updatedValue == 0) {
			message += " They're down!";
		}

		await InteractionUtils.send(intr, message);
	}
}
