import { ChatInputCommandInteraction } from 'discord.js';

import { TranslationFunctions } from '../../../i18n/i18n-types.js';
import { Kobold } from '@kobold/db';
import { KoboldEmbed } from '../../../utils/kobold-embed-utils.js';
import { KoboldUtils } from '../../../utils/kobold-service-utils/kobold-utils.js';
import { Command } from '../../index.js';
import { RollMacroCommand } from '@kobold/documentation';
import { BaseCommandClass } from '../../command.js';

export class RollMacroListSubCommand extends BaseCommandClass(
	RollMacroCommand,
	RollMacroCommand.subCommandEnum.list
) {
	public async execute(
		intr: ChatInputCommandInteraction,
		LL: TranslationFunctions,
		{ kobold }: { kobold: Kobold }
	): Promise<void> {
		const koboldUtils = new KoboldUtils(kobold);
		const { activeCharacter } = await koboldUtils.fetchNonNullableDataForCommand(intr, {
			activeCharacter: true,
		});

		const rollMacros = activeCharacter.sheetRecord.rollMacros;
		const fields = [];
		for (const rollMacro of rollMacros.sort((a, b) => (a.name || '').localeCompare(b.name))) {
			fields.push({
				name: rollMacro.name,
				value: rollMacro.macro,
				inline: true,
			});
		}

		const embed = await new KoboldEmbed();
		embed.setCharacter(activeCharacter);
		embed.setTitle(`${activeCharacter.name}'s Roll Macros`);
		embed.addFields(fields);
		await embed.sendBatches(intr);
	}
}
