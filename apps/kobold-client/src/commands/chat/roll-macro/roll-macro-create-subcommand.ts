import { ChatInputCommandInteraction } from 'discord.js';

import { Kobold } from '@kobold/db';
import { InteractionUtils } from '../../../utils/index.js';
import { FinderHelpers } from '../../../utils/kobold-helpers/finder-helpers.js';
import { KoboldUtils } from '../../../utils/kobold-service-utils/kobold-utils.js';
import { RollBuilder } from '../../../utils/roll-builder.js';
import { Command } from '../../index.js';
import { RollMacroDefinition } from '@kobold/documentation';
import { BaseCommandClass } from '../../command.js';
const commandOptions = RollMacroDefinition.options;
const commandOptionsEnum = RollMacroDefinition.commandOptionsEnum;

export class RollMacroCreateSubCommand extends BaseCommandClass(
	RollMacroDefinition,
	RollMacroDefinition.subCommandEnum.create
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
			.getString(commandOptions[commandOptionsEnum.name].name, true)
			.trim();
		const macro = intr.options.getString(commandOptions[commandOptionsEnum.value].name, true);

		// make sure the name does't already exist in the character's rollMacros
		if (FinderHelpers.getRollMacroByName(activeCharacter.sheetRecord, name)) {
			await InteractionUtils.send(
				intr,
				RollMacroDefinition.strings.create.alreadyExists({
					macroName: name,
					characterName: activeCharacter.name,
				})
			);
			return;
		}

		// test that the macro is a valid roll
		const rollBuilder = new RollBuilder({ character: activeCharacter });
		rollBuilder.addRoll({ rollExpression: macro, rollTitle: 'test' });
		const result = rollBuilder.rollResults[0];
		if ((result as any)?.error || (result as any)?.results?.error?.length) {
			await InteractionUtils.send(intr, RollMacroDefinition.strings.doesntEvaluateError);
			return;
		}

		await kobold.sheetRecord.update(
			{ id: activeCharacter.sheetRecord.id },
			{
				rollMacros: [
					...activeCharacter.sheetRecord.rollMacros,
					{
						name,
						macro,
					},
				],
			}
		);

		//send a response
		await InteractionUtils.send(
			intr,
			RollMacroDefinition.strings.create.created({
				macroName: name,
				characterName: activeCharacter.name,
			})
		);
		return;
	}
}
