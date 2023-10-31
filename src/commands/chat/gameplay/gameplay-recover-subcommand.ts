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

import { Command, CommandDeferType } from '../../index.js';
import L from '../../../i18n/i18n-node.js';
import { TranslationFunctions } from '../../../i18n/i18n-types.js';
import { GameplayOptions } from './gameplay-command-options.js';
import { AutocompleteUtils } from '../../../utils/autocomplete-utils.js';
import { GameplayUtils } from '../../../utils/gameplay-utils.js';
import { InteractionUtils } from '../../../utils/interaction-utils.js';
import { InitiativeActor, InitiativeActorModel } from '../../../services/kobold/index.js';
import { GameUtils } from '../../../utils/game-utils.js';

export class GameplayRecoverSubCommand implements Command {
	public names = [L.en.commands.gameplay.recover.name()];
	public metadata: RESTPostAPIChatInputApplicationCommandsJSONBody = {
		type: ApplicationCommandType.ChatInput,
		name: L.en.commands.gameplay.recover.name(),
		description: L.en.commands.gameplay.recover.description(),
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
			GameplayOptions.GAMEPLAY_TARGET_CHARACTER.name
		);

		const { characterOrInitActorTargets } = await GameUtils.getCharacterOrInitActorTarget(
			intr,
			targetCharacter
		);
		if (!characterOrInitActorTargets?.length) {
			if (!targetCharacter) {
				await InteractionUtils.send(
					intr,
					`Yip! I couldn't find an active character to target! Specify a "target-character" to target something else.`
				);
			} else {
				await InteractionUtils.send(
					intr,
					`Yip! I couldn't find any characters or initiative actors named ${targetCharacter}!`
				);
			}
			return;
		}

		const recoverValues = await GameplayUtils.recoverGameplayStats(
			intr,
			characterOrInitActorTargets
		);
		if (!recoverValues.length) {
			await InteractionUtils.send(
				intr,
				`Yip! I tried to recover ${characterOrInitActorTargets[0].name}'s stats, but their stats are already full!`
			);
			return;
		} else {
			let recoveredStats;
			if (
				characterOrInitActorTargets.some(
					character => character instanceof InitiativeActorModel && character.hideStats
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
				`Yip! ${characterOrInitActorTargets[0].name} recovered! ${recoveredStats.join(
					', '
				)}`
			);
		}
	}
}
