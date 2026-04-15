import {
	ApplicationCommandOptionChoiceData,
	AutocompleteFocusedOption,
	AutocompleteInteraction,
	CacheType,
	ChatInputCommandInteraction,
} from 'discord.js';

import { Kobold } from '@kobold/db';
import { KoboldError } from '../../../utils/KoboldError.js';
import { InteractionUtils } from '../../../utils/index.js';
import { FinderHelpers } from '../../../utils/kobold-helpers/finder-helpers.js';
import { KoboldUtils } from '../../../utils/kobold-service-utils/kobold-utils.js';
import { RollBuilder } from '../../../utils/roll-builder.js';
import { Command } from '../../index.js';
import { RollMacroDefinition } from '@kobold/documentation';
import { BaseCommandClass } from '../../command.js';
import {
	parseCreateForValue,
	CreateForTargets,
} from '../../../utils/kobold-service-utils/autocomplete-utils.js';

const commandOptions = RollMacroDefinition.options;
const commandOptionsEnum = RollMacroDefinition.commandOptionsEnum;

export class RollMacroCreateSubCommand extends BaseCommandClass(
	RollMacroDefinition,
	RollMacroDefinition.subCommandEnum.create
) {
	public async autocomplete(
		intr: AutocompleteInteraction<CacheType>,
		option: AutocompleteFocusedOption,
		{ kobold }: { kobold: Kobold }
	): Promise<ApplicationCommandOptionChoiceData[] | undefined> {
		if (!intr.isAutocomplete()) return;

		const koboldUtils = new KoboldUtils(kobold);

		if (option.name === commandOptions[commandOptionsEnum.createFor].name) {
			const match = intr.options.getString(commandOptions[commandOptionsEnum.createFor].name);
			return koboldUtils.autocompleteUtils.getCreateForOptions(intr, match ?? '');
		}
	}

	public async execute(
		intr: ChatInputCommandInteraction,
		{ kobold }: { kobold: Kobold }
	): Promise<void> {
		const koboldUtils = new KoboldUtils(kobold);

		// Get characters and minions for create-for parsing
		const { characters, minions } =
			await koboldUtils.autocompleteUtils.getUserCharactersAndMinions(intr);

		// Parse create-for value
		const createForValue = intr.options.getString(
			commandOptions[commandOptionsEnum.createFor].name
		);
		const sheetRecordId = parseCreateForValue(createForValue, characters, minions);

		// Determine target name based on create-for value
		let targetName: string = 'User';

		if (sheetRecordId !== null) {
			const char = characters.find(c => c.sheetRecordId === sheetRecordId);
			const minion = minions.find(m => m.sheetRecordId === sheetRecordId);
			if (char) {
				targetName = char.name;
			} else if (minion) {
				targetName = minion.name;
			} else {
				throw new KoboldError(`Yip! Could not find a character or minion with that ID.`);
			}
		}

		// Try to get active character for roll expression validation
		let validationCharacter:
			| Awaited<
					ReturnType<typeof koboldUtils.fetchNonNullableDataForCommand>
			  >['activeCharacter']
			| null = null;
		try {
			const data = await koboldUtils.fetchNonNullableDataForCommand(intr, {
				activeCharacter: true,
			});
			validationCharacter = data.activeCharacter;
		} catch {
			// No active character - skip roll expression validation
		}

		let name = intr.options
			.getString(commandOptions[commandOptionsEnum.name].name, true)
			.trim();
		const macro = intr.options.getString(commandOptions[commandOptionsEnum.value].name, true);

		// Check for name conflicts
		if (sheetRecordId === null) {
			// Check user-wide roll macros
			const existingMacros = await kobold.rollMacro.readManyUserWide({
				userId: intr.user.id,
			});
			if (FinderHelpers.getRollMacroByName(existingMacros, name)) {
				await InteractionUtils.send(
					intr,
					RollMacroDefinition.strings.create.alreadyExists({
						macroName: name,
						characterName: 'your user-wide roll macros',
					})
				);
				return;
			}
		} else {
			// Check character/minion-specific macros (includes user-wide to prevent conflicts)
			const existingMacros = await kobold.rollMacro.readManyForCharacter({
				userId: intr.user.id,
				sheetRecordId,
			});
			if (FinderHelpers.getRollMacroByName(existingMacros, name)) {
				await InteractionUtils.send(
					intr,
					RollMacroDefinition.strings.create.alreadyExists({
						macroName: name,
						characterName: targetName,
					})
				);
				return;
			}
		}

		// test that the macro is a valid roll (only if we have a validation character)
		if (validationCharacter) {
			const rollBuilder = new RollBuilder({ character: validationCharacter });
			rollBuilder.addRoll({ rollExpression: macro, rollTitle: 'test' });
			const result = rollBuilder.rollResults[0];
			if ((result as any)?.error || (result as any)?.results?.error?.length) {
				await InteractionUtils.send(intr, RollMacroDefinition.strings.doesntEvaluateError);
				return;
			}
		}

		await kobold.rollMacro.create({
			userId: intr.user.id,
			name,
			macro,
			sheetRecordId,
		});

		//send a response
		await InteractionUtils.send(
			intr,
			RollMacroDefinition.strings.create.created({
				macroName: name,
				characterName: targetName,
			})
		);
		return;
	}
}
