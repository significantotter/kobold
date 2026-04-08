import {
	ApplicationCommandOptionChoiceData,
	AutocompleteFocusedOption,
	AutocompleteInteraction,
	CacheType,
	ChatInputCommandInteraction,
} from 'discord.js';

import {
	Kobold,
	Modifier,
	NewModifier,
	SheetAdjustment,
	SheetAdjustmentTypeEnum,
	isSheetAdjustmentTypeEnum,
} from '@kobold/db';
import { KoboldError } from '../../../utils/KoboldError.js';
import { InteractionUtils } from '../../../utils/index.js';
import { FinderHelpers } from '../../../utils/kobold-helpers/finder-helpers.js';
import { KoboldUtils } from '../../../utils/kobold-service-utils/kobold-utils.js';
import { SheetUtils } from '../../../utils/sheet/sheet-utils.js';
import { Command } from '../../index.js';
import { Creature } from '../../../utils/creature.js';
import { InputParseUtils } from '../../../utils/input-parse-utils.js';
import { ModifierDefinition } from '@kobold/documentation';
import { BaseCommandClass } from '../../command.js';
import {
	parseCreateForValue,
	CreateForTargets,
} from '../../../utils/kobold-service-utils/autocomplete-utils.js';

const commandOptions = ModifierDefinition.options;
const commandOptionsEnum = ModifierDefinition.commandOptionsEnum;

export class ModifierCreateSubCommand extends BaseCommandClass(
	ModifierDefinition,
	ModifierDefinition.subCommandEnum.create
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

		// Determine target name and validation character based on create-for value
		let targetName: string = 'User';
		let validationCharacter:
			| Awaited<
					ReturnType<typeof koboldUtils.fetchNonNullableDataForCommand>
			  >['activeCharacter']
			| null = null;

		if (sheetRecordId === null) {
			// User-wide modifier
			targetName = 'User';
			// We need a character for validation - use active character if available
			try {
				const data = await koboldUtils.fetchNonNullableDataForCommand(intr, {
					activeCharacter: true,
				});
				validationCharacter = data.activeCharacter;
			} catch {
				// No active character - that's okay for user-wide
			}
		} else {
			// Specific character or minion
			// Look up the name
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

		let name = intr.options
			.getString(commandOptions[commandOptionsEnum.name].name, true)
			.trim()
			.toLowerCase();
		let modifierType = (
			intr.options.getString(commandOptions[commandOptionsEnum.type].name) ??
			SheetAdjustmentTypeEnum.untyped
		)
			.trim()
			.toLowerCase();
		const modifierSeverity =
			intr.options.getString(commandOptions[commandOptionsEnum.severity].name) ?? null;

		const rollAdjustment = intr.options.getString(
			commandOptions[commandOptionsEnum.rollAdjustment].name
		);
		let rollTargetTagsUnparsed = intr.options.getString(
			commandOptions[commandOptionsEnum.targetTags].name
		);
		let rollTargetTags = rollTargetTagsUnparsed ? rollTargetTagsUnparsed.trim() : null;

		let description = intr.options.getString(
			commandOptions[commandOptionsEnum.description].name
		);
		let note = intr.options.getString(commandOptions[commandOptionsEnum.initiativeNote].name);
		const modifierSheetValues = intr.options.getString(
			commandOptions[commandOptionsEnum.sheetValues].name
		);

		if (!isSheetAdjustmentTypeEnum(modifierType)) {
			throw new KoboldError(
				`Yip! ${modifierType} is not a valid modifier type! Please use one ` +
					`of the suggested options when entering the modifier type or leave it blank.`
			);
		}
		// check various failure conditions
		// we can't have target tags but no roll adjustment
		if (rollTargetTags && !rollAdjustment) {
			await InteractionUtils.send(
				intr,
				'Yip! You need to provide a roll adjustment if you want to use target tags!'
			);
			return;
		}
		// we can't have a roll adjustment but no target tags
		if (rollAdjustment && !rollTargetTags) {
			await InteractionUtils.send(
				intr,
				'Yip! You need to provide target tags if you want to use a roll adjustment!'
			);
			return;
		}
		// we can't have neither a roll adjustment nor a sheet adjustment
		if (!rollAdjustment && !modifierSheetValues) {
			await InteractionUtils.send(
				intr,
				'Yip! You need to provide either a roll adjustment or a sheet adjustment!'
			);
			return;
		}

		if (rollAdjustment && rollTargetTags) {
			// the tags for the modifier have to be valid
			if (!InputParseUtils.isValidRollTargetTags(rollTargetTags)) {
				throw new KoboldError(ModifierDefinition.strings.createModifier.invalidTags);
			}
			// Only validate dice expression if we have a validation character
			if (validationCharacter) {
				if (
					!InputParseUtils.isValidDiceExpression(
						rollAdjustment,
						Creature.fromSheetRecord(validationCharacter, undefined, intr)
					)
				) {
					throw new KoboldError(
						ModifierDefinition.strings.createModifier.doesntEvaluateError
					);
				}
			}
		}

		let parsedSheetAdjustments: SheetAdjustment[] = [];
		if (modifierSheetValues && validationCharacter) {
			parsedSheetAdjustments = InputParseUtils.parseAsSheetAdjustments(
				modifierSheetValues,
				modifierType,
				validationCharacter.sheetRecord.sheet
			);
		} else if (modifierSheetValues && !validationCharacter) {
			// Parse without sheet validation for user-wide modifiers
			parsedSheetAdjustments = InputParseUtils.parseAsSheetAdjustments(
				modifierSheetValues,
				modifierType,
				null as any // Skip sheet validation
			);
		}

		// Check for name conflicts - for user-wide, check all user modifiers
		// For character-specific, check that character's modifiers
		if (sheetRecordId === null) {
			const existingModifiers = await kobold.modifier.readManyUserWide({
				userId: intr.user.id,
			});
			if (FinderHelpers.getModifierByName(existingModifiers, name)) {
				await InteractionUtils.send(
					intr,
					ModifierDefinition.strings.createModifier.alreadyExists({
						modifierName: name,
						characterName: 'your user-wide modifiers',
					})
				);
				return;
			}
		} else if (validationCharacter) {
			if (FinderHelpers.getModifierByName(validationCharacter.modifiers, name)) {
				await InteractionUtils.send(
					intr,
					ModifierDefinition.strings.createModifier.alreadyExists({
						modifierName: name,
						characterName: targetName,
					})
				);
				return;
			}
		}

		const newModifier: Omit<Modifier, 'id'> = {
			name,
			isActive: true,
			description:
				InputParseUtils.parseAsNullableString(description, {
					inputName: 'description',
					maxLength: 300,
				}) ?? '',
			type: modifierType,
			severity: InputParseUtils.parseAsNullableNumber(modifierSeverity),
			sheetAdjustments: parsedSheetAdjustments,
			rollTargetTags: rollTargetTags ?? null,
			rollAdjustment,
			note: InputParseUtils.parseAsNullableString(note, {
				inputName: 'initiative-note',
				maxLength: 40,
			}),
			sheetRecordId,
			userId: intr.user.id,
		};

		// make sure that the adjustments are valid and can be applied to a sheet
		if (validationCharacter) {
			SheetUtils.adjustSheetWithModifiers(validationCharacter.sheetRecord.sheet, [
				newModifier,
			]);
		}

		await kobold.modifier.create(newModifier);

		// Trigger adjusted_sheet recomputation
		if (sheetRecordId !== null) {
			koboldUtils.adjustedSheetService.triggerRecompute(sheetRecordId);
		} else {
			koboldUtils.adjustedSheetService.triggerRecomputeAllForUser(intr.user.id);
		}

		//send a response
		await InteractionUtils.send(
			intr,
			ModifierDefinition.strings.createModifier.created({
				modifierName: name,
				characterName: targetName,
			})
		);
		return;
	}
}
