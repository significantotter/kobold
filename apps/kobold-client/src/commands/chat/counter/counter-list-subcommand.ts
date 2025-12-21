import { ChatInputCommandInteraction } from 'discord.js';

import { Kobold } from '@kobold/db';
import { KoboldEmbed } from '../../../utils/kobold-embed-utils.js';
import { KoboldUtils } from '../../../utils/kobold-service-utils/kobold-utils.js';
import { Command } from '../../index.js';
import { CounterHelpers } from './counter-helpers.js';
import { CounterGroupHelpers } from '../counter-group/counter-group-helpers.js';
import { CounterDefinition } from '@kobold/documentation';
import { BaseCommandClass } from '../../command.js';
const commandOptions = CounterDefinition.options;
const commandOptionsEnum = CounterDefinition.commandOptionsEnum;

export class CounterListSubCommand extends BaseCommandClass(
	CounterDefinition,
	CounterDefinition.subCommandEnum.list
) {
	public async execute(
		intr: ChatInputCommandInteraction,
		{ kobold }: { kobold: Kobold }
	): Promise<void> {
		let hideGroups =
			intr.options.getBoolean(
				commandOptions[commandOptionsEnum.counterListHideGroups].name
			) ?? false;
		const koboldUtils = new KoboldUtils(kobold);
		const { activeCharacter } = await koboldUtils.fetchNonNullableDataForCommand(intr, {
			activeCharacter: true,
		});

		const embed = await new KoboldEmbed();
		embed.setCharacter(activeCharacter);
		embed.setTitle(`${activeCharacter.name}'s Counters`);

		embed.setFields(
			...(!hideGroups
				? activeCharacter.sheetRecord.sheet.counterGroups.map(counterGroup => ({
						name: counterGroup.name,
						value: CounterGroupHelpers.detailCounterGroup(counterGroup),
					}))
				: []),
			...activeCharacter.sheetRecord.sheet.countersOutsideGroups.map(counter => ({
				name: counter.name,
				value: CounterHelpers.detailCounter(counter),
			}))
		);
		await embed.sendBatches(intr);
	}
}
