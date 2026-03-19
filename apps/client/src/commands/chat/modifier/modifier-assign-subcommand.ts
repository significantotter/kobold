import {
	ApplicationCommandOptionChoiceData,
	AutocompleteFocusedOption,
	AutocompleteInteraction,
	CacheType,
	ChatInputCommandInteraction,
} from 'discord.js';

import { Modifier, Kobold } from '@kobold/db';

import { KoboldError } from '../../../utils/KoboldError.js';
import { InteractionUtils } from '../../../utils/index.js';
import { FinderHelpers } from '../../../utils/kobold-helpers/finder-helpers.js';
import { KoboldUtils } from '../../../utils/kobold-service-utils/kobold-utils.js';
import { Command } from '../../index.js';
import { ModifierDefinition } from '@kobold/documentation';
import { BaseCommandClass } from '../../command.js';
import {
	parseCreateForValue,
	CreateForTargets,
} from '../../../utils/kobold-service-utils/autocomplete-utils.js';

const commandOptions = ModifierDefinition.options;
const commandOptionsEnum = ModifierDefinition.commandOptionsEnum;

export class ModifierAssignSubCommand extends BaseCommandClass(
	ModifierDefinition,
	ModifierDefinition.subCommandEnum.assign
) {
	public async autocomplete(
		intr: AutocompleteInteraction<CacheType>,
		option: AutocompleteFocusedOption,
		{ kobold }: { kobold: Kobold }
	): Promise<ApplicationCommandOptionChoiceData[] | undefined> {
		if (!intr.isAutocomplete()) return;

		const koboldUtils = new KoboldUtils(kobold);

		if (option.name === commandOptions[commandOptionsEnum.targetModifier].name) {
			const match =
				intr.options.getString(commandOptions[commandOptionsEnum.targetModifier].name) ??
				'';

			// Get all user's modifiers for autocomplete
			const modifiers = await kobold.modifier.readManyByUser({
				userId: intr.user.id,
				filter: 'all',
			});

			const matchedModifiers = FinderHelpers.matchAllModifiers(modifiers, match).map(
				modifier => ({
					name: modifier.name,
					value: modifier.name,
				})
			);

			return matchedModifiers;
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

		const modifierTarget = intr.options.getString(
			commandOptions[commandOptionsEnum.targetModifier].name,
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
			targetName = 'your user-wide modifiers';
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

		// Find the modifier to assign
		const modifiers = await kobold.modifier.readManyByUser({
			userId: intr.user.id,
			filter: 'all',
		});

		const matchedModifier = modifiers.find(
			(modifier: Modifier) =>
				modifier.name.toLocaleLowerCase() === modifierTarget.toLocaleLowerCase()
		);

		if (!matchedModifier) {
			await InteractionUtils.send(intr, ModifierDefinition.strings.notFound);
			return;
		}

		// Check if target already has a modifier with the same name
		let existingModifiers: Modifier[];
		if (newSheetRecordId === null) {
			existingModifiers = await kobold.modifier.readManyUserWide({
				userId: intr.user.id,
			});
		} else {
			existingModifiers = await kobold.modifier.readManyForCharacter({
				userId: intr.user.id,
				sheetRecordId: newSheetRecordId,
			});
		}

		if (FinderHelpers.getModifierByName(existingModifiers, matchedModifier.name)) {
			throw new KoboldError(
				ModifierDefinition.strings.assign.alreadyExists({
					modifierName: matchedModifier.name,
					targetName,
				})
			);
		}

		if (copyOption) {
			// Create a copy instead of moving
			const { id, ...modifierWithoutId } = matchedModifier;
			await kobold.modifier.create({
				...modifierWithoutId,
				sheetRecordId: newSheetRecordId,
				userId: intr.user.id,
			});

			await InteractionUtils.send(
				intr,
				ModifierDefinition.strings.assign.copied({
					modifierName: matchedModifier.name,
					targetName,
				})
			);
		} else {
			// Move the modifier
			await kobold.modifier.update(
				{ id: matchedModifier.id },
				{ sheetRecordId: newSheetRecordId }
			);

			await InteractionUtils.send(
				intr,
				ModifierDefinition.strings.assign.success({
					modifierName: matchedModifier.name,
					targetName,
				})
			);
		}
	}
}
