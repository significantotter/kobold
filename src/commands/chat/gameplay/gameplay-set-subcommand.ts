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

import { Command, CommandDeferType } from '../../index.js';
import L from '../../../i18n/i18n-node.js';
import { TranslationFunctions } from '../../../i18n/i18n-types.js';
import { InteractionUtils } from '../../../utils/interaction-utils.js';
import { AutocompleteUtils } from '../../../utils/autocomplete-utils.js';
import { GameplayUtils } from '../../../utils/gameplay-utils.js';
import _ from 'lodash';
import { SettableSheetOption } from '../../../utils/creature.js';
import { CharacterUtils } from '../../../utils/character-utils.js';
import { Character, InitiativeActor } from '../../../services/kobold/models/index.js';
import { GameUtils } from '../../../utils/game-utils.js';
import { KoboldError } from '../../../utils/KoboldError.js';

export class GameplaySetSubCommand implements Command {
	public names = [L.en.commands.gameplay.set.name()];
	public metadata: RESTPostAPIChatInputApplicationCommandsJSONBody = {
		type: ApplicationCommandType.ChatInput,
		name: L.en.commands.gameplay.set.name(),
		description: L.en.commands.gameplay.set.description(),
		dm_permission: true,
		default_member_permissions: undefined,
	};
	public deferType = CommandDeferType.PUBLIC;
	public requireClientPerms: PermissionsString[] = [];

	public async autocomplete(
		intr: AutocompleteInteraction<CacheType>,
		option: AutocompleteFocusedOption
	): Promise<ApplicationCommandOptionChoiceData[] | undefined> {
		if (!intr.isAutocomplete()) return;
		if (option.name === GameplayOptions.GAMEPLAY_TARGET_CHARACTER.name) {
			return await AutocompleteUtils.getAllTargetOptions(intr, option.value);
		}
	}

	public async execute(
		intr: ChatInputCommandInteraction,
		LL: TranslationFunctions
	): Promise<void> {
		const targetCharacter = intr.options.getString(
			GameplayOptions.GAMEPLAY_TARGET_CHARACTER.name,
			true
		);
		const option = _.camelCase(
			intr.options.getString(GameplayOptions.GAMEPLAY_SET_OPTION.name, true)
		) as SettableSheetOption;
		const value = intr.options.getString(GameplayOptions.GAMEPLAY_SET_VALUE.name, true);

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
		if (!initialValue || !updatedValue) {
			throw new KoboldError(
				`Yip! Something went wrong! I couldn't update the property ${option} to ${value}.}`
			);
		}
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
