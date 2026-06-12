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
	SheetAdjustment,
	SheetAdjustmentTypeEnum,
	isSheetAdjustmentTypeEnum,
} from '@kobold/db';
import { KoboldError } from '@kobold/util';
import { InteractionUtils } from '../../../utils/index.js';
import { FinderHelpers } from '../../../utils/kobold-helpers/finder-helpers.js';
import { KoboldUtils } from '../../../utils/kobold-service-utils/kobold-utils.js';
import { Command } from '../../index.js';
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

		// Determine target name based on create-for value.
		let targetName: string = 'User';

		if (sheetRecordId === null) {
			targetName = 'User';
		} else {
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
			if (!InputParseUtils.isValidDiceExpression(rollAdjustment)) {
				throw new KoboldError(
					ModifierDefinition.strings.createModifier.doesntEvaluateError
				);
			}
		}

		let parsedSheetAdjustments: SheetAdjustment[] = [];
		if (modifierSheetValues) {
			parsedSheetAdjustments = InputParseUtils.parseAsSheetAdjustments(
				modifierSheetValues,
				modifierType
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
		} else {
			const existingModifiers = await kobold.modifier.readManyBySheetRecordId({
				sheetRecordId,
			});
			if (FinderHelpers.getModifierByName(existingModifiers, name)) {
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
				maxLength: InputParseUtils.INITIATIVE_NOTE_MAX_LENGTH,
			}),
			sheetRecordId,
			userId: intr.user.id,
		};

		await kobold.modifier.create(newModifier);

		if (sheetRecordId !== null) {
			koboldUtils.adjustedSheetService.triggerRecompute(sheetRecordId);
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
