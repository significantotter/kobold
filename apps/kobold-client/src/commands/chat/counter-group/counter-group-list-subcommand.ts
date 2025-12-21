import { ChatInputCommandInteraction } from 'discord.js';

import { Kobold } from '@kobold/db';
import { KoboldEmbed } from '../../../utils/kobold-embed-utils.js';
import { KoboldUtils } from '../../../utils/kobold-service-utils/kobold-utils.js';
import { Command } from '../../index.js';
import { CounterGroupHelpers } from './counter-group-helpers.js';
import { CounterGroupDefinition } from '@kobold/documentation';
import { BaseCommandClass } from '../../command.js';

export class CounterGroupListSubCommand extends BaseCommandClass(
	CounterGroupDefinition,
	CounterGroupDefinition.subCommandEnum.list
) {
	public async execute(
		intr: ChatInputCommandInteraction,
		{ kobold }: { kobold: Kobold }
	): Promise<void> {
		const koboldUtils = new KoboldUtils(kobold);
		const { activeCharacter } = await koboldUtils.fetchNonNullableDataForCommand(intr, {
			activeCharacter: true,
		});

		const embed = await new KoboldEmbed();
		embed.setCharacter(activeCharacter);
		embed.setTitle(`${activeCharacter.name}'s Counter Groups`);
		embed.setFields(
			activeCharacter.sheetRecord.sheet.counterGroups.map(counterGroup => ({
				name: counterGroup.name,
				value: CounterGroupHelpers.detailCounterGroup(counterGroup),
			}))
		);
		await embed.sendBatches(intr);
	}
}
