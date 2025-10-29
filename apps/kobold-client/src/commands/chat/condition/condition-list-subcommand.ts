import {
	ApplicationCommandOptionChoiceData,
	AutocompleteFocusedOption,
	AutocompleteInteraction,
	CacheType,
	ChatInputCommandInteraction,
} from 'discord.js';
import { KoboldEmbed } from '../../../utils/kobold-embed-utils.js';

import { TranslationFunctions } from '../../../i18n/i18n-types.js';
import { Kobold } from '@kobold/db';
import { KoboldUtils } from '../../../utils/kobold-service-utils/kobold-utils.js';
import { ModifierHelpers } from './../modifier/modifier-helpers.js';
import { GameplayOptions } from '../gameplay/gameplay-command-options.js';
import { ConditionCommand } from '@kobold/documentation';
import { BaseCommandClass } from '../../command.js';

export class ConditionListSubCommand extends BaseCommandClass(
	ConditionCommand,
	ConditionCommand.subCommandEnum.list
) {
	public async autocomplete(
		intr: AutocompleteInteraction<CacheType>,
		option: AutocompleteFocusedOption,
		{ kobold }: { kobold: Kobold }
	): Promise<ApplicationCommandOptionChoiceData[] | undefined> {
		if (!intr.isAutocomplete()) return;
		if (option.name === GameplayOptions.GAMEPLAY_TARGET_CHARACTER.name) {
			const match =
				intr.options.getString(GameplayOptions.GAMEPLAY_TARGET_CHARACTER.name) ?? '';
			const { autocompleteUtils } = new KoboldUtils(kobold);
			return await autocompleteUtils.getAllTargetOptions(intr, match);
		}
	}
	public async execute(
		intr: ChatInputCommandInteraction,
		LL: TranslationFunctions,
		{ kobold }: { kobold: Kobold }
	): Promise<void> {
		const koboldUtils = new KoboldUtils(kobold);
		const { gameUtils } = koboldUtils;
		const targetCharacterName = intr.options.getString(
			GameplayOptions.GAMEPLAY_TARGET_CHARACTER.name,
			true
		);
		const { targetSheetRecord } = await gameUtils.getCharacterOrInitActorTarget(
			intr,
			targetCharacterName
		);
		const conditions = targetSheetRecord.conditions;
		const fields = [];
		for (const condition of conditions.sort((a, b) => (a.name || '').localeCompare(b.name))) {
			let value: string;
			value = ModifierHelpers.detailModifier(condition);

			fields.push({
				name: condition.name,
				value,
				inline: true,
			});
		}

		const embed = await new KoboldEmbed();
		embed.setSheetRecord(targetSheetRecord);
		embed.setTitle(`${targetSheetRecord.sheet.staticInfo.name}'s Conditions`);
		embed.addFields(fields);

		await embed.sendBatches(intr);
	}
}
