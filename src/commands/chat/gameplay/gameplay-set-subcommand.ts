import {
	ApplicationCommandOptionChoiceData,
	ApplicationCommandType,
	AutocompleteFocusedOption,
	AutocompleteInteraction,
	CacheType,
	ChatInputCommandInteraction,
	PermissionsString,
	RESTPostAPIChatInputApplicationCommandsJSONBody,
} from 'discord.js';

import { GameplayOptions } from './gameplay-command-options.js';

import _ from 'lodash';
import L from '../../../i18n/i18n-node.js';
import { TranslationFunctions } from '../../../i18n/i18n-types.js';
import { Kobold, SheetBaseCounterKeys } from '../../../services/kobold/index.js';
import { KoboldError } from '../../../utils/KoboldError.js';
import { Creature } from '../../../utils/creature.js';
import { InteractionUtils } from '../../../utils/interaction-utils.js';
import { KoboldUtils } from '../../../utils/kobold-service-utils/kobold-utils.js';
import { Command, CommandDeferType } from '../../index.js';

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
		option: AutocompleteFocusedOption,
		{ kobold }: { kobold: Kobold }
	): Promise<ApplicationCommandOptionChoiceData[] | undefined> {
		if (!intr.isAutocomplete()) return;
		if (option.name === GameplayOptions.GAMEPLAY_TARGET_CHARACTER.name) {
			const { autocompleteUtils } = new KoboldUtils(kobold);
			return await autocompleteUtils.getAllTargetOptions(intr, option.value);
		}
	}

	public async execute(
		intr: ChatInputCommandInteraction,
		LL: TranslationFunctions,
		{ kobold }: { kobold: any }
	): Promise<void> {
		const targetCharacter = intr.options.getString(
			GameplayOptions.GAMEPLAY_TARGET_CHARACTER.name,
			true
		);
		const option = _.camelCase(
			intr.options.getString(GameplayOptions.GAMEPLAY_SET_OPTION.name, true)
		) as SheetBaseCounterKeys;

		const value = intr.options.getString(GameplayOptions.GAMEPLAY_SET_VALUE.name, true);

		const { gameUtils, gameplayUtils } = new KoboldUtils(kobold);

		const { targetSheetRecord, hideStats, targetName } =
			await gameUtils.getCharacterOrInitActorTarget(intr, targetCharacter);

		const creature = Creature.fromSheetRecord(targetSheetRecord);

		const { initialValue, updatedValue } = await gameplayUtils.setGameplayStats(
			intr,
			targetSheetRecord,
			creature,
			option,
			value
		);
		if (!initialValue || !updatedValue) {
			throw new KoboldError(
				`Yip! Something went wrong! I couldn't update the property ${option} to ${value}.}`
			);
		}
		let message;

		if (hideStats) {
			let verbed = 'increased';
			let diff = updatedValue - initialValue;
			if (diff < 0) {
				verbed = 'decreased';
			}
			message = `Yip! I ${verbed} ${targetName}'s ${option} by ${Math.abs(diff)}.`;
		} else {
			message = `Yip! I updated ${targetName}'s ${option} from ${initialValue} to ${updatedValue}.`;
		}
		if (option === 'hp' && updatedValue == 0) {
			message += " They're down!";
		}

		await InteractionUtils.send(intr, message);
	}
}
