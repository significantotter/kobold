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
import { EmbedUtils } from '../../../utils/kobold-embed-utils.js';
import { KoboldUtils } from '../../../utils/kobold-service-utils/kobold-utils.js';
import { Command } from '../../index.js';
import { GameplayDefinition } from '@kobold/documentation';
import { BaseCommandClass } from '../../command.js';
const commandOptions = GameplayDefinition.options;
const commandOptionsEnum = GameplayDefinition.commandOptionsEnum;

export class GameplayDamageSubCommand extends BaseCommandClass(
	GameplayDefinition,
	GameplayDefinition.subCommandEnum.damage
) {
	public async autocomplete(
		intr: AutocompleteInteraction<CacheType>,
		option: AutocompleteFocusedOption,
		{ kobold }: { kobold: Kobold }
	): Promise<ApplicationCommandOptionChoiceData[] | undefined> {
		if (!intr.isAutocomplete()) return;
		if (option.name === commandOptions[commandOptionsEnum.gameplayTargetCharacter].name) {
			const match =
				intr.options.getString(
					commandOptions[commandOptionsEnum.gameplayTargetCharacter].name
				) ?? '';
			const { autocompleteUtils } = new KoboldUtils(kobold);
			return await autocompleteUtils.getAllTargetOptions(intr, match);
		}
	}

	public async execute(
		intr: ChatInputCommandInteraction,
		{ kobold }: { kobold: Kobold }
	): Promise<void> {
		const targetCharacter = intr.options.getString(
			commandOptions[commandOptionsEnum.gameplayTargetCharacter].name,
			true
		);
		const amount = intr.options.getNumber(
			commandOptions[commandOptionsEnum.gameplayDamageAmount].name,
			true
		);
		const type = intr.options.getString(
			commandOptions[commandOptionsEnum.gameplayDamageType].name
		);

		const { gameUtils, creatureUtils } = new KoboldUtils(kobold);

		const { targetSheetRecord, hideStats, targetName } =
			await gameUtils.getCharacterOrInitActorTarget(intr, targetCharacter);

		const creature = new Creature(targetSheetRecord, targetName, intr);

		let message = '';
		if (amount >= 0) {
			const damageResult = creature.applyDamage(amount, type ?? 'untyped');

			message = EmbedUtils.buildDamageResultText({
				initialDamageAmount: amount,
				targetCreatureName: creature.name,
				totalDamageDealt: damageResult.appliedDamage,
				targetCreatureSheet: creature.sheet,
				triggeredResistances: damageResult.appliedResistance
					? [damageResult.appliedResistance]
					: [],
				triggeredWeaknesses: damageResult.appliedWeakness
					? [damageResult.appliedWeakness]
					: [],
				triggeredImmunities: damageResult.appliedImmunity
					? [damageResult.appliedImmunity]
					: [],
			});
		} else {
			const healingResult = creature.heal(Math.abs(amount));

			message = EmbedUtils.buildDamageResultText({
				initialDamageAmount: amount,
				targetCreatureName: creature.name,
				totalDamageDealt: -healingResult.totalHealed,
				targetCreatureSheet: creature.sheet,
			});
		}
		await creatureUtils.saveSheet(intr, targetSheetRecord);

		await InteractionUtils.send(intr, message);
	}
}
