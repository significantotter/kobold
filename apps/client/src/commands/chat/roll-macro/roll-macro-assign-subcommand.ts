import {
	ApplicationCommandOptionChoiceData,
	AutocompleteFocusedOption,
	AutocompleteInteraction,
	CacheType,
	ChatInputCommandInteraction,
} from 'discord.js';

import { RollMacro, Kobold } from '@kobold/db';

import { KoboldError } from '../../../utils/KoboldError.js';
import { InteractionUtils } from '../../../utils/index.js';
import { FinderHelpers } from '../../../utils/kobold-helpers/finder-helpers.js';
import { KoboldUtils } from '../../../utils/kobold-service-utils/kobold-utils.js';
import { Command } from '../../index.js';
import { RollMacroDefinition } from '@kobold/documentation';
import { BaseCommandClass } from '../../command.js';
import {
	parseCreateForValue,
	CreateForTargets,
} from '../../../utils/kobold-service-utils/autocomplete-utils.js';

const commandOptions = RollMacroDefinition.options;
const commandOptionsEnum = RollMacroDefinition.commandOptionsEnum;

export class RollMacroAssignSubCommand extends BaseCommandClass(
	RollMacroDefinition,
	RollMacroDefinition.subCommandEnum.assign
) {
	public async autocomplete(
		intr: AutocompleteInteraction<CacheType>,
		option: AutocompleteFocusedOption,
		{ kobold }: { kobold: Kobold }
	): Promise<ApplicationCommandOptionChoiceData[] | undefined> {
		if (!intr.isAutocomplete()) return;

		const koboldUtils = new KoboldUtils(kobold);

		if (option.name === commandOptions[commandOptionsEnum.targetMacro].name) {
			const match =
				intr.options.getString(commandOptions[commandOptionsEnum.targetMacro].name) ?? '';

			// Get all user's roll macros for autocomplete
			const rollMacros = await kobold.rollMacro.readManyByUser({
				userId: intr.user.id,
				filter: 'all',
			});

			const matchedMacros = FinderHelpers.matchAllRollMacros(rollMacros, match).map(
				macro => ({
					name: macro.name,
					value: macro.name,
				})
			);

			return matchedMacros;
		}

		if (option.name === commandOptions[commandOptionsEnum.assignTo].name) {
			const match = intr.options.getString(commandOptions[commandOptionsEnum.assignTo].name);
			return koboldUtils.autocompleteUtils.getAssignToOptions(intr, match ?? '');
		}
	}

	public async execute(
		intr: ChatInputCommandInteraction,
		{ kobold }: { kobold: Kobold }
	): Promise<void> {
		const koboldUtils = new KoboldUtils(kobold);

		const macroTarget = intr.options.getString(
			commandOptions[commandOptionsEnum.targetMacro].name,
			true
		);
		const assignToValue = intr.options.getString(
			commandOptions[commandOptionsEnum.assignTo].name,
			true
		);
		const copyOption = intr.options.getBoolean(commandOptions[commandOptionsEnum.copy].name);

		// Get characters and minions for parsing
		const { characters, minions } =
			await koboldUtils.autocompleteUtils.getUserCharactersAndMinions(intr);

		// Parse assign-to value
		const newSheetRecordId = parseCreateForValue(assignToValue, characters, minions);

		// Determine target name for messages
		let targetName: string;
		if (newSheetRecordId === null) {
			targetName = 'your user-wide roll macros';
		} else {
			const char = characters.find(c => c.sheetRecordId === newSheetRecordId);
			const minion = minions.find(m => m.sheetRecordId === newSheetRecordId);
			if (char) {
				targetName = char.name;
			} else if (minion) {
				targetName = minion.name;
			} else {
				throw new KoboldError(`Yip! Could not find a character or minion with that ID.`);
			}
		}

		// Find the roll macro to assign
		const rollMacros = await kobold.rollMacro.readManyByUser({
			userId: intr.user.id,
			filter: 'all',
		});

		const matchedMacro = rollMacros.find(
			(macro: RollMacro) => macro.name.toLocaleLowerCase() === macroTarget.toLocaleLowerCase()
		);

		if (!matchedMacro) {
			await InteractionUtils.send(intr, RollMacroDefinition.strings.notFound);
			return;
		}

		// Check if target already has a roll macro with the same name
		let existingMacros: RollMacro[];
		if (newSheetRecordId === null) {
			existingMacros = await kobold.rollMacro.readManyUserWide({
				userId: intr.user.id,
			});
		} else {
			existingMacros = await kobold.rollMacro.readManyForCharacter({
				userId: intr.user.id,
				sheetRecordId: newSheetRecordId,
			});
		}

		if (FinderHelpers.getRollMacroByName(existingMacros, matchedMacro.name)) {
			throw new KoboldError(
				RollMacroDefinition.strings.assign.alreadyExists({
					macroName: matchedMacro.name,
					targetName,
				})
			);
		}

		if (copyOption) {
			// Create a copy instead of moving
			const { id, ...macroWithoutId } = matchedMacro;
			await kobold.rollMacro.create({
				...macroWithoutId,
				sheetRecordId: newSheetRecordId,
				userId: intr.user.id,
			});

			await InteractionUtils.send(
				intr,
				RollMacroDefinition.strings.assign.copied({
					macroName: matchedMacro.name,
					targetName,
				})
			);
		} else {
			// Move the roll macro
			await kobold.rollMacro.update(
				{ id: matchedMacro.id },
				{ sheetRecordId: newSheetRecordId }
			);

			await InteractionUtils.send(
				intr,
				RollMacroDefinition.strings.assign.success({
					macroName: matchedMacro.name,
					targetName,
				})
			);
		}
	}
}
