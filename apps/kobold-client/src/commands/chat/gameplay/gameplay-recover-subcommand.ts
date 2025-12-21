import {
	ApplicationCommandOptionChoiceData,
	AutocompleteFocusedOption,
	AutocompleteInteraction,
	CacheType,
	ChatInputCommandInteraction,
} from 'discord.js';

import { Kobold } from '@kobold/db';
import { Creature } from '../../../utils/creature.js';
import { InteractionUtils } from '../../../utils/interaction-utils.js';
import { KoboldUtils } from '../../../utils/kobold-service-utils/kobold-utils.js';
import { Command } from '../../index.js';
import { GameplayDefinition } from '@kobold/documentation';
import { BaseCommandClass } from '../../command.js';
const commandOptions = GameplayDefinition.options;
const commandOptionsEnum = GameplayDefinition.commandOptionsEnum;

export class GameplayRecoverSubCommand extends BaseCommandClass(
	GameplayDefinition,
	GameplayDefinition.subCommandEnum.recover
) {
	public async autocomplete(
		intr: AutocompleteInteraction<CacheType>,
		option: AutocompleteFocusedOption,
		{ kobold }: { kobold: Kobold }
	): Promise<ApplicationCommandOptionChoiceData[] | undefined> {
		if (!intr.isAutocomplete()) return;
		if (option.name === commandOptions[commandOptionsEnum.gameplayTargetCharacter].name) {
			const { autocompleteUtils } = new KoboldUtils(kobold);
			return await autocompleteUtils.getAllTargetOptions(intr, option.value);
		}
	}

	public async execute(
		intr: ChatInputCommandInteraction,
		{ kobold }: { kobold: any }
	): Promise<void> {
		const targetCharacter = intr.options.getString(
			commandOptions[commandOptionsEnum.gameplayTargetCharacter].name,
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
