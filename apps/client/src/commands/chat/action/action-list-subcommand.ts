import { ChatInputCommandInteraction } from 'discord.js';
import { Kobold } from '@kobold/db';

import { KoboldEmbed } from '../../../utils/kobold-embed-utils.js';
import { KoboldUtils } from '../../../utils/kobold-service-utils/kobold-utils.js';
import { Command } from '../../index.js';
import { ActionDefinition } from '@kobold/documentation';
import { BaseCommandClass } from '../../command.js';

export class ActionListSubCommand extends BaseCommandClass(
	ActionDefinition,
	ActionDefinition.subCommandEnum.list
) {
	public async execute(
		intr: ChatInputCommandInteraction,
		{ kobold }: { kobold: Kobold }
	): Promise<void> {
		const koboldUtils = new KoboldUtils(kobold);
		const { activeCharacter } = await koboldUtils.fetchNonNullableDataForCommand(intr, {
			activeCharacter: true,
		});

		const actions = activeCharacter.sheetRecord.actions;
		const fields = [];
		for (const action of actions.sort((a, b) => (a.name || '').localeCompare(b.name))) {
			let description = action.description || '\u200B';
			if ((action.description ?? '').length >= 1000)
				description = description.substring(0, 1000) + '...';
			fields.push({
				name: action.name || 'unnamed action',
				value: description,
				inline: true,
			});
		}

		const embed = await new KoboldEmbed();
		embed.setCharacter(activeCharacter);
		embed.setTitle(`${activeCharacter?.name}'s Available Actions`);
		embed.addFields(fields);
		await embed.sendBatches(intr);
	}
}
