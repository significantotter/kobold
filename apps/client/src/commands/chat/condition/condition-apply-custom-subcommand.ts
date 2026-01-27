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
import { KoboldError } from '../../../utils/KoboldError.js';
import { InteractionUtils } from '../../../utils/index.js';
import { FinderHelpers } from '../../../utils/kobold-helpers/finder-helpers.js';
import { KoboldUtils } from '../../../utils/kobold-service-utils/kobold-utils.js';
import { SheetUtils } from '../../../utils/sheet/sheet-utils.js';
import { Command } from '../../index.js';
import { Creature } from '../../../utils/creature.js';
import { InputParseUtils } from '../../../utils/input-parse-utils.js';
import { ConditionDefinition, GameplayDefinition, ModifierDefinition } from '@kobold/documentation';
import { BaseCommandClass } from '../../command.js';
const commandOptions = ConditionDefinition.options;
const commandOptionsEnum = ConditionDefinition.commandOptionsEnum;

export class ConditionApplyCustomSubCommand extends BaseCommandClass(
	ConditionDefinition,
	ConditionDefinition.subCommandEnum.applyCustom
) {
	public async autocomplete(
		intr: AutocompleteInteraction<CacheType>,
		option: AutocompleteFocusedOption,
		{ kobold }: { kobold: Kobold }
	): Promise<ApplicationCommandOptionChoiceData[] | undefined> {
		if (!intr.isAutocomplete()) return;
		if (option.name === commandOptions[commandOptionsEnum.targetCharacter].name) {
			const match =
				intr.options.getString(commandOptions[commandOptionsEnum.targetCharacter].name) ??
				'';
			const { autocompleteUtils } = new KoboldUtils(kobold);
			return await autocompleteUtils.getAllTargetOptions(intr, match);
		}
	}

	public async execute(
		intr: ChatInputCommandInteraction,
		{ kobold }: { kobold: Kobold }
	): Promise<void> {
		const koboldUtils = new KoboldUtils(kobold);
		const { gameUtils } = koboldUtils;
		const targetCharacter = intr.options.getString(
			commandOptions[commandOptionsEnum.targetCharacter].name,
			true
		);
		const { targetSheetRecord } = await gameUtils.getCharacterOrInitActorTarget(
			intr,
			targetCharacter
		);

		let name = intr.options
			.getString(commandOptions[commandOptionsEnum.name].name, true)
			.trim()
			.toLowerCase();
		let conditionType = (
			intr.options.getString(commandOptions[commandOptionsEnum.type].name) ??
			SheetAdjustmentTypeEnum.untyped
		)
			.trim()
			.toLowerCase();
		const conditionSeverity =
			intr.options.getString(commandOptions[commandOptionsEnum.severity].name) ?? null;

		const rollAdjustment = intr.options.getString(
			commandOptions[commandOptionsEnum.rollAdjustment].name
		);
		const rollTargetTagsUnparsed = intr.options.getString(
			commandOptions[commandOptionsEnum.targetTags].name
		);
		let rollTargetTags = rollTargetTagsUnparsed ? rollTargetTagsUnparsed.trim() : null;

		let description = intr.options.getString(
			commandOptions[commandOptionsEnum.description].name
		);
		let note = intr.options.getString(commandOptions[commandOptionsEnum.initiativeNote].name);
		const conditionSheetValues = intr.options.getString(
			commandOptions[commandOptionsEnum.sheetValues].name
		);

		if (!isSheetAdjustmentTypeEnum(conditionType)) {
			throw new KoboldError(
				`Yip! ${conditionType} is not a valid type! Please use one ` +
					`of the suggested options when entering the condition type or leave it blank.`
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
		if (!rollAdjustment && !conditionSheetValues) {
			await InteractionUtils.send(
				intr,
				'Yip! You need to provide either a roll adjustment or a sheet adjustment!'
			);
			return;
		}

		if (rollAdjustment && rollTargetTags) {
			// the tags for the modifier have to be valid
			if (!InputParseUtils.isValidRollTargetTags(rollTargetTags)) {
				throw new KoboldError(ConditionDefinition.strings.invalidTags);
			}
			if (
				!InputParseUtils.isValidDiceExpression(
					rollAdjustment,
					new Creature(targetSheetRecord, undefined, intr)
				)
			) {
				throw new KoboldError(ConditionDefinition.strings.doesntEvaluateError);
			}
		}

		let parsedSheetAdjustments: SheetAdjustment[] = [];
		if (conditionSheetValues) {
			parsedSheetAdjustments = InputParseUtils.parseAsSheetAdjustments(
				conditionSheetValues,
				conditionType,
				targetSheetRecord.sheet
			);
		}
		// make sure the name does't already exist in the character's conditions
		if (FinderHelpers.getConditionByName(targetSheetRecord, name)) {
			await InteractionUtils.send(
				intr,
				ConditionDefinition.strings.alreadyExists({
					conditionName: name,
					characterName: targetSheetRecord.sheet.staticInfo.name,
				})
			);
			return;
		}

		const newCondition: Modifier = {
			name: InputParseUtils.parseAsString(name, {
				inputName: 'name',
				minLength: 3,
				maxLength: 20,
			}),
			isActive: true,
			description: InputParseUtils.parseAsNullableString(description, {
				inputName: 'description',
				maxLength: 300,
			}),
			type: conditionType,
			severity: InputParseUtils.parseAsNullableNumber(conditionSeverity),
			sheetAdjustments: parsedSheetAdjustments,
			rollTargetTags,
			rollAdjustment,
			note: InputParseUtils.parseAsNullableString(note, {
				inputName: 'initiative-note',
				maxLength: 40,
			}),
		};

		// make sure that the adjustments are valid and can be applied to a sheet
		SheetUtils.adjustSheetWithModifiers(targetSheetRecord.sheet, [newCondition]);

		await kobold.sheetRecord.update(
			{ id: targetSheetRecord.id },
			{
				conditions: [...targetSheetRecord.conditions, newCondition],
			}
		);

		//send a response
		await InteractionUtils.send(
			intr,
			ConditionDefinition.strings.created({
				conditionName: name,
				characterName: targetSheetRecord.sheet.staticInfo.name,
			})
		);
		return;
	}
}
