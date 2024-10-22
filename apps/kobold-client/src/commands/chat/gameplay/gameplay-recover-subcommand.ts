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

import L from '../../../i18n/i18n-node.js';
import { TranslationFunctions } from '../../../i18n/i18n-types.js';
import { Kobold } from '@kobold/db';
import { Creature } from '../../../utils/creature.js';
import { InteractionUtils } from '../../../utils/interaction-utils.js';
import { KoboldUtils } from '../../../utils/kobold-service-utils/kobold-utils.js';
import { Command, CommandDeferType } from '../../index.js';
import { GameplayOptions } from './gameplay-command-options.js';

export class GameplayRecoverSubCommand implements Command {
	public name = L.en.commands.gameplay.recover.name();
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

		const { gameUtils, gameplayUtils } = new KoboldUtils(kobold);

		const { targetSheetRecord, hideStats, targetName } =
			await gameUtils.getCharacterOrInitActorTarget(intr, targetCharacter);
		const targetCreature = new Creature(targetSheetRecord, targetName, intr);

		const recoverValues = await gameplayUtils.recoverGameplayStats(
			intr,
			targetSheetRecord,
			targetCreature
		);
		if (!recoverValues.length) {
			await InteractionUtils.send(
				intr,
				`Yip! I tried to recover ${targetName}'s stats, but their stats are already full!`
			);
			return;
		} else {
			let recoveredStats;
			if (hideStats) {
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
				`Yip! ${targetName} recovered! ${recoveredStats.join(', ')}`
			);
		}
	}
}
