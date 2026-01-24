import {
	ApplicationCommandOptionChoiceData,
	AutocompleteFocusedOption,
	AutocompleteInteraction,
	CacheType,
	ChatInputCommandInteraction,
} from 'discord.js';

import _ from 'lodash';
import { Kobold } from '@kobold/db';
import { DiceRollResult } from '../../../utils/dice-utils.js';
import { InteractionUtils } from '../../../utils/index.js';
import { KoboldEmbed } from '../../../utils/kobold-embed-utils.js';
import { FinderHelpers } from '../../../utils/kobold-helpers/finder-helpers.js';
import { KoboldUtils } from '../../../utils/kobold-service-utils/kobold-utils.js';
import { RollBuilder } from '../../../utils/roll-builder.js';
import { Command } from '../../index.js';
import { RollMacroDefinition } from '@kobold/documentation';
import { BaseCommandClass } from '../../command.js';
const commandOptions = RollMacroDefinition.options;
const commandOptionsEnum = RollMacroDefinition.commandOptionsEnum;

export class RollMacroSetSubCommand extends BaseCommandClass(
	RollMacroDefinition,
	RollMacroDefinition.subCommandEnum.set
) {
	public async autocomplete(
		intr: AutocompleteInteraction<CacheType>,
		option: AutocompleteFocusedOption,
		{ kobold }: { kobold: Kobold }
	): Promise<ApplicationCommandOptionChoiceData[] | undefined> {
		if (!intr.isAutocomplete()) return;
		if (option.name === commandOptions[commandOptionsEnum.name].name) {
			//we don't need to autocomplete if we're just dealing with whitespace
			const { autocompleteUtils } = new KoboldUtils(kobold);
			const match =
				intr.options.getString(commandOptions[commandOptionsEnum.name].name) ?? '';
			return await autocompleteUtils.getAllMatchingRollsMacrosForCharacter(intr, match);
		}
	}

	public async execute(
		intr: ChatInputCommandInteraction,
		{ kobold }: { kobold: Kobold }
	): Promise<void> {
		const rollMacroName = intr.options
			.getString(commandOptions[commandOptionsEnum.name].name, true)
			.trim();
		let macro = intr.options
			.getString(commandOptions[commandOptionsEnum.value].name, true)
			.toLocaleLowerCase()
			.trim();

		const koboldUtils = new KoboldUtils(kobold);
		const { activeCharacter } = await koboldUtils.fetchNonNullableDataForCommand(intr, {
			activeCharacter: true,
		});

		let updateValue: string | string[] | number;

		const targetRollMacro = FinderHelpers.getRollMacroByName(
			activeCharacter.sheetRecord,
			rollMacroName
		);

		if (!targetRollMacro) {
			// no matching roll macro found
			await InteractionUtils.send(intr, RollMacroDefinition.strings.notFound);
			return;
		}

		// test that the macro is a valid roll
		const rollBuilder = new RollBuilder({ character: activeCharacter });
		rollBuilder.addRoll({ rollExpression: macro, rollTitle: 'test' });
		const result: DiceRollResult = rollBuilder.rollResults[0] as DiceRollResult;
		if (result.results.errors.length > 0) {
			await InteractionUtils.send(intr, RollMacroDefinition.strings.doesntEvaluateError);
			return;
		}

		// still references the deep values in characterRollMacros
		let targetIndex = _.indexOf(activeCharacter.sheetRecord.rollMacros, targetRollMacro);

		activeCharacter.sheetRecord.rollMacros[targetIndex].macro = macro;

		kobold.sheetRecord.update(
			{ id: activeCharacter.sheetRecord.id },
			{ rollMacros: activeCharacter.sheetRecord.rollMacros }
		);

		const updateEmbed = new KoboldEmbed();
		updateEmbed.setTitle(
			RollMacroDefinition.strings.set.successEmbedTitle({
				characterName: activeCharacter.name,
				macroName: targetRollMacro.name,
				newMacroValue: macro,
			})
		);

		await InteractionUtils.send(intr, updateEmbed);
	}
}
