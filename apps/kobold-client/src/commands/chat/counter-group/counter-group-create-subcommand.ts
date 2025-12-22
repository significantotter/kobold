import { ChatInputCommandInteraction } from 'discord.js';

import { Kobold } from '@kobold/db';
import { InteractionUtils } from '../../../utils/index.js';
import { FinderHelpers } from '../../../utils/kobold-helpers/finder-helpers.js';
import { KoboldUtils } from '../../../utils/kobold-service-utils/kobold-utils.js';
import { Command } from '../../index.js';
import { InputParseUtils } from '../../../utils/input-parse-utils.js';
import { KoboldError } from '../../../utils/KoboldError.js';
import { CounterGroupDefinition } from '@kobold/documentation';
import { BaseCommandClass } from '../../command.js';
const commandOptions = CounterGroupDefinition.options;
const commandOptionsEnum = CounterGroupDefinition.commandOptionsEnum;

export class CounterGroupCreateSubCommand extends BaseCommandClass(
	CounterGroupDefinition,
	CounterGroupDefinition.subCommandEnum.create
) {
	public async execute(
		intr: ChatInputCommandInteraction,
		{ kobold }: { kobold: Kobold }
	): Promise<void> {
		const koboldUtils = new KoboldUtils(kobold);
		const { activeCharacter } = await koboldUtils.fetchNonNullableDataForCommand(intr, {
			activeCharacter: true,
		});
		let name = intr.options
			.getString(commandOptions[commandOptionsEnum.counterGroupName].name, true)
			.trim();
		let description = intr.options.getString(
			commandOptions[commandOptionsEnum.counterGroupDescription].name
		);

		if (!InputParseUtils.isValidString(name, { maxLength: 50 })) {
			throw new KoboldError(`Yip! The counter group name must be less than 50 characters!`);
		}
		const { counter } = FinderHelpers.getCounterByName(activeCharacter.sheetRecord.sheet, name);
		if (counter) {
			throw new KoboldError(
				CounterGroupDefinition.strings.alreadyExists({
					groupName: name,
					characterName: activeCharacter.name,
				})
			);
		}
		if (description && !InputParseUtils.isValidString(description, { maxLength: 300 })) {
			throw new KoboldError(
				`Yip! The counter group description must be less than 300 characters!`
			);
		}
		if (
			activeCharacter.sheetRecord.sheet.counterGroups.find(
				group => group.name.toLowerCase() === name.toLowerCase()
			)
		) {
			throw new KoboldError(
				CounterGroupDefinition.strings.alreadyExists({
					groupName: name,
					characterName: activeCharacter.name,
				})
			);
		}

		//create the counter group
		await kobold.sheetRecord.update(
			{ id: activeCharacter.sheetRecord.id },
			{
				sheet: {
					...activeCharacter.sheetRecord.sheet,
					counterGroups: [
						...activeCharacter.sheetRecord.sheet.counterGroups,
						{
							name: name,
							description: description,
							counters: [],
						},
					],
				},
			}
		);

		//send a response
		await InteractionUtils.send(
			intr,
			CounterGroupDefinition.strings.created({
				groupName: name,
				characterName: activeCharacter.name,
			})
		);
		return;
	}
}
