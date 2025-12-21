import { ChatInputCommandInteraction } from 'discord.js';

import { Kobold } from '@kobold/db';
import { KoboldEmbed } from '../../../utils/kobold-embed-utils.js';
import { KoboldUtils } from '../../../utils/kobold-service-utils/kobold-utils.js';
import { Command } from '../../index.js';
import { RollMacroDefinition } from '@kobold/documentation';
import { BaseCommandClass } from '../../command.js';

export class RollMacroListSubCommand extends BaseCommandClass(
	RollMacroDefinition,
	RollMacroDefinition.subCommandEnum.list
) {
	public async execute(
		intr: ChatInputCommandInteraction,
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
