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
import { ModifierDefinition, sharedStrings } from '@kobold/documentation';
import { BaseCommandClass } from '../../command.js';
import { parseAssignToValue } from '../../../utils/kobold-service-utils/autocomplete-utils.js';

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
			return koboldUtils.autocompleteUtils.getAssignToOptionsWithGame(intr, match ?? '');
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

		// Get characters and minions for parsing (user's own + game)
		const { characters, minions } =
			await koboldUtils.autocompleteUtils.getUserCharactersAndMinions(intr);
		const { gameCharacters, gameMinions } =
			await koboldUtils.autocompleteUtils.getGameCharactersAndMinions(intr);
		const initActors = await koboldUtils.autocompleteUtils.getInitiativeActors(intr);

		// Parse assign-to value with game character and initiative actor support
		const assignToResult = parseAssignToValue(
			assignToValue,
			intr.user.id,
			characters,
			minions,
			gameCharacters,
			gameMinions,
			initActors
		);

		// Safeguard: require copy option when assigning to another player's character
		if (assignToResult.isOtherPlayersCharacter && !copyOption) {
			throw new KoboldError(
				sharedStrings.errors.copyRequiredForOtherPlayer({
					targetName: assignToResult.targetName,
					itemType: 'modifier',
				})
			);
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
		if (assignToResult.sheetRecordId === null) {
			existingModifiers = await kobold.modifier.readManyUserWide({
				userId: assignToResult.targetUserId ?? intr.user.id,
			});
		} else {
			existingModifiers = await kobold.modifier.readManyForCharacter({
				userId: assignToResult.targetUserId ?? intr.user.id,
				sheetRecordId: assignToResult.sheetRecordId,
			});
		}

		if (FinderHelpers.getModifierByName(existingModifiers, matchedModifier.name)) {
			throw new KoboldError(
				ModifierDefinition.strings.assign.alreadyExists({
					modifierName: matchedModifier.name,
					targetName: assignToResult.targetName,
				})
			);
		}

		if (copyOption || assignToResult.isOtherPlayersCharacter) {
			// Create a copy instead of moving
			const { id, ...modifierWithoutId } = matchedModifier;
			await kobold.modifier.create({
				...modifierWithoutId,
				sheetRecordId: assignToResult.sheetRecordId,
				userId: assignToResult.targetUserId ?? intr.user.id,
			});

			await InteractionUtils.send(
				intr,
				ModifierDefinition.strings.assign.copied({
					modifierName: matchedModifier.name,
					targetName: assignToResult.targetName,
				})
			);
		} else {
			// Move the modifier
			await kobold.modifier.update(
				{ id: matchedModifier.id },
				{ sheetRecordId: assignToResult.sheetRecordId }
			);

			await InteractionUtils.send(
				intr,
				ModifierDefinition.strings.assign.success({
					modifierName: matchedModifier.name,
					targetName: assignToResult.targetName,
				})
			);
		}
	}
}
