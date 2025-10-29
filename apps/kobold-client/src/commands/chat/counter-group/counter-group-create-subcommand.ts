import { ChatInputCommandInteraction } from 'discord.js';
import { CounterGroupOptions } from './counter-group-command-options.js';
import { TranslationFunctions } from '../../../i18n/i18n-types.js';
import { Kobold } from '@kobold/db';
import { InteractionUtils } from '../../../utils/index.js';
import { FinderHelpers } from '../../../utils/kobold-helpers/finder-helpers.js';
import { KoboldUtils } from '../../../utils/kobold-service-utils/kobold-utils.js';
import { Command } from '../../index.js';
import { InputParseUtils } from '../../../utils/input-parse-utils.js';
import { KoboldError } from '../../../utils/KoboldError.js';
import { CounterGroupCommand } from '@kobold/documentation';
import { BaseCommandClass } from '../../command.js';

export class CounterGroupCreateSubCommand extends BaseCommandClass(
	CounterGroupCommand,
	CounterGroupCommand.subCommandEnum.create
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
		let name = intr.options
			.getString(CounterGroupOptions.COUNTER_GROUP_NAME_OPTION.name, true)
			.trim();
		let description = intr.options.getString(
			CounterGroupOptions.COUNTER_GROUP_DESCRIPTION_OPTION.name
		);

		if (!InputParseUtils.isValidString(name, { maxLength: 50 })) {
			throw new KoboldError(`Yip! The counter group name must be less than 50 characters!`);
		}
		const { counter } = FinderHelpers.getCounterByName(activeCharacter.sheetRecord.sheet, name);
		if (counter) {
			throw new KoboldError(
				LL.commands.counterGroup.create.interactions.alreadyExists({
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
				LL.commands.counterGroup.create.interactions.alreadyExists({
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
			LL.commands.counterGroup.create.interactions.created({
				groupName: name,
				characterName: activeCharacter.name,
			})
		);
		return;
	}
}
